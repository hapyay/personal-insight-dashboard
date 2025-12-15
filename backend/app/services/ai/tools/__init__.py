# AI工具集初始化文件
from .emotion_tools import *
from .finance_tools import *
from .skill_tools import *
from .learning_tools import *

# 所有工具列表
TOOLS = [
    create_emotion_entry,
    get_emotion_history,
    update_emotion_entry,
    create_finance_entry,
    get_finance_history,
    analyze_finance,
    create_skill_entry,
    get_skill_progress,
    update_skill_progress,
    create_learning_entry,
    get_learning_history,
    analyze_learning
]
