import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DataChartProps {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'radar';
  data: any;
  title?: string;
  width?: number | string;
  height?: number | string;
  options?: any;
}

const DataChart: React.FC<DataChartProps> = ({ 
  type, 
  data, 
  title = '', 
  width = '100%', 
  height = 400, 
  options = {} 
}) => {
  // 生成基础配置
  const getBaseOptions = () => {
    const baseOptions = {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: data.legend || [],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      ...options
    };

    return baseOptions;
  };

  // 根据类型生成图表配置
  const generateOptions = () => {
    const baseOptions = getBaseOptions();

    switch (type) {
      case 'line':
        return {
          ...baseOptions,
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.xAxis || []
          },
          yAxis: {
            type: 'value'
          },
          series: data.series?.map((s: any) => ({
            name: s.name,
            type: 'line',
            stack: s.stack || '',
            data: s.data || []
          })) || []
        };

      case 'bar':
        return {
          ...baseOptions,
          xAxis: {
            type: 'category',
            data: data.xAxis || []
          },
          yAxis: {
            type: 'value'
          },
          series: data.series?.map((s: any) => ({
            name: s.name,
            type: 'bar',
            data: s.data || []
          })) || []
        };

      case 'pie':
        return {
          ...baseOptions,
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          series: [{
            name: title,
            type: 'pie',
            radius: '50%',
            center: ['50%', '40%'],
            data: data.series || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };

      case 'scatter':
        return {
          ...baseOptions,
          xAxis: {
            type: 'value',
            name: data.xAxis?.name || 'X轴',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: data.yAxis?.name || 'Y轴',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          series: data.series?.map((s: any) => ({
            name: s.name,
            type: 'scatter',
            data: s.data || []
          })) || []
        };

      case 'radar':
        return {
          ...baseOptions,
          radar: {
            indicator: data.indicator || [],
            radius: '65%'
          },
          series: data.series?.map((s: any) => ({
            name: s.name,
            type: 'radar',
            data: s.data || []
          })) || []
        };

      default:
        return baseOptions;
    }
  };

  const chartOptions = generateOptions();

  return (
    <div style={{ width, height }}>
      <ReactECharts option={chartOptions} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default DataChart;
