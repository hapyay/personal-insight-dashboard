import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Skill } from '../services/skillService';

interface SkillTreeVisualizationProps {
  skills: Skill[];
  width?: number;
  height?: number;
  onSkillClick?: (skill: Skill) => void;
}

const SkillTreeVisualization: React.FC<SkillTreeVisualizationProps> = ({ 
  skills, 
  width = 800, 
  height = 600,
  onSkillClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    if (!skills || skills.length === 0) return;

    // 清除之前的绘制
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // 设置边距
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 添加背景
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', '#f9f9f9')
      .attr('rx', 8);

    // 构建技能树数据结构
    const buildSkillTree = () => {
      // 按技能类别和等级分组
      const categoryGroups: Record<string, Record<number, Skill[]>> = {};
      
      skills.forEach(skill => {
        const category = skill.category || '其他';
        const level = skill.level;
        
        if (!categoryGroups[category]) {
          categoryGroups[category] = {};
        }
        if (!categoryGroups[category][level]) {
          categoryGroups[category][level] = [];
        }
        categoryGroups[category][level].push(skill);
      });

      // 转换为D3层次结构
      const root = {
        name: '技能树',
        children: Object.entries(categoryGroups).map(([category, levelGroups]) => ({
          name: category,
          children: Object.entries(levelGroups).map(([level, levelSkills]) => ({
            name: `等级 ${level}`,
            children: levelSkills.map(skill => ({
              name: skill.name,
              id: skill.id,
              progress: skill.progress,
              category: skill.category,
              level: skill.level,
              description: skill.description,
              originalSkill: skill
            }))
          }))
        }))
      };

      return root;
    };

    const root = d3.hierarchy(buildSkillTree());

    // 创建树布局
    const treeLayout = d3.tree<any>()
      .size([innerHeight, innerWidth]) // 交换x和y，使树垂直生长
      .separation((a, b) => {
        // 增加同级节点间距
        return a.parent === b.parent ? 1 : 0.5;
      });

    treeLayout(root);

    // 创建连接线
    const link = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6)
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y || 0)
        .y(d => d.x || 0));

    // 添加连线动画
    link.attr('stroke-dasharray', function() {
      const length = this.getTotalLength();
      return `${length} ${length}`;
    })
    .attr('stroke-dashoffset', function() {
      return this.getTotalLength();
    })
    .transition()
    .duration(1500)
    .attr('stroke-dashoffset', 0)
    .transition()
    .duration(500)
    .attr('stroke-opacity', 0.6);

    // 创建节点组
    const nodeGroups = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y || 0},${d.x || 0})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (d.data.originalSkill) {
          setSelectedSkill(d.data.originalSkill);
          if (onSkillClick) {
            onSkillClick(d.data.originalSkill);
          }
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 25)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.children ? 15 : 20)
          .attr('stroke-width', 2);
      });

    // 添加节点圆形
    const nodeCircle = nodeGroups.append('circle')
      .attr('r', d => d.children ? 15 : 20)
      .attr('fill', d => {
        // 根据节点类型设置不同的颜色
        if (d.depth === 0) { // 根节点
          return '#1890ff';
        } else if (d.depth === 1) { // 类别节点
          return '#52c41a';
        } else if (d.depth === 2) { // 等级节点
          return '#faad14';
        } else { // 技能节点
          // 根据进度设置颜色
          const progress = d.data.progress || 0;
          if (progress >= 80) return '#52c41a';
          if (progress >= 50) return '#1890ff';
          if (progress >= 20) return '#faad14';
          return '#ff7875';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .duration(500)
      .attr('opacity', 1);

    // 添加节点文本
    const nodeText = nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -25 : 25)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .attr('font-size', d => {
        if (d.depth === 0) return 16;
        if (d.depth === 1) return 14;
        if (d.depth === 2) return 12;
        return 11;
      })
      .attr('font-weight', d => d.depth <= 2 ? 'bold' : 'normal')
      .attr('fill', '#333')
      .attr('opacity', 0)
      .text(d => d.data.name)
      .transition()
      .duration(800)
      .attr('opacity', 1);

    // 添加进度标签（只针对技能节点）
    nodeGroups.filter(d => d.depth === 3)
      .append('text')
      .attr('dy', '2.5em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .attr('fill', '#666')
      .attr('opacity', 0)
      .text(d => `${(d.data.progress || 0)}%`)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    // 添加技能节点进度圆环
    nodeGroups.filter(d => d.depth === 3)
      .each(function(d) {
        const progress = d.data.progress || 0;
        const radius = 20;
        const x = 0;
        const y = 0;
        
        // 创建进度圆环
        const circleGroup = d3.select(this).append('g');
        
        // 背景圆环
        circleGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', '#e8e8e8')
          .attr('stroke-width', 4);
        
        // 进度圆环
        const arc = d3.arc()
          .innerRadius(radius - 4)
          .outerRadius(radius)
          .startAngle(-Math.PI / 2)
          .endAngle(-Math.PI / 2 + (progress / 100) * 2 * Math.PI);
        
        circleGroup.append('path')
          .attr('d', arc)
          .attr('fill', '#1890ff')
          .attr('opacity', 0.7)
          .transition()
          .duration(1500)
          .attrTween('d', function() {
            const i = d3.interpolate(0, progress);
            return function(t) {
              const currentProgress = i(t);
              return d3.arc()
                .innerRadius(radius - 4)
                .outerRadius(radius)
                .startAngle(-Math.PI / 2)
                .endAngle(-Math.PI / 2 + (currentProgress / 100) * 2 * Math.PI)();
            };
          });
      });

  }, [skills, width, height, onSkillClick]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
        }} 
      />
    </div>
  );
};

export default SkillTreeVisualization;