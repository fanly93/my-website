export interface StatsData {
  studyDays: number
  completedQa: number
  masteryRate: number
  streakDays: number
}

export interface Goal {
  id: string
  text: string
  estimatedMinutes: number
}

export interface Suggestion {
  id: string
  title: string
  category: string
  estimatedMinutes: number
}

export interface QaRecord {
  id: string
  question: string
  answer: string
  createdAt: string
}

export interface TrendPoint {
  date: string
  studyMinutes: number
  completedCount: number
}

export const STATS_DATA: StatsData = {
  studyDays: 42,
  completedQa: 318,
  masteryRate: 76,
  streakDays: 7,
}

export const GOALS: Goal[] = [
  { id: '1', text: '阅读 RAG 论文《REALM》精读笔记', estimatedMinutes: 40 },
  { id: '2', text: '完成 LangChain Agent 实战练习', estimatedMinutes: 60 },
  { id: '3', text: '整理 Prompt Engineering 最佳实践', estimatedMinutes: 30 },
  { id: '4', text: '复习向量数据库索引原理', estimatedMinutes: 25 },
]

export const SUGGESTIONS: Suggestion[] = [
  { id: '1', title: 'RAG 检索增强生成核心原理', category: 'RAG', estimatedMinutes: 35 },
  { id: '2', title: 'ReAct Agent 思考-行动框架解析', category: 'Agent', estimatedMinutes: 45 },
  { id: '3', title: 'Chain-of-Thought 提示词设计指南', category: 'Prompt', estimatedMinutes: 20 },
  { id: '4', title: '多模态大模型输入输出处理', category: '多模态', estimatedMinutes: 50 },
  { id: '5', title: 'Fine-tuning vs RAG 选型对比', category: 'RAG', estimatedMinutes: 30 },
  { id: '6', title: 'Tool Use 工具调用协议详解', category: 'Agent', estimatedMinutes: 40 },
]

export const QA_HISTORY: QaRecord[] = [
  {
    id: '1',
    question: 'RAG 中 Chunk 的大小如何选择？',
    answer: 'Chunk 大小的选择需要权衡上下文完整性与检索精度。通常推荐 256–512 token 的固定分块，同时设置 10–20% 的重叠（overlap）避免边界信息丢失。对于结构化文档（如代码、表格），可使用语义分块策略，按段落或函数边界切割。实际项目中建议通过评估集对不同 chunk size 进行 A/B 测试，以 Recall@K 作为主指标。',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    question: 'LLM 幻觉问题的主要缓解方案有哪些？',
    answer: '主要缓解手段包括：1) RAG 检索增强，将回答锚定在可验证的外部知识；2) 思维链（CoT）提示引导模型逐步推理；3) 自我一致性（Self-consistency）采样多条推理路径取多数投票；4) 输出后验证，用独立模型或规则引擎检查事实；5) RLHF/RLAIF 对齐训练降低训练阶段的幻觉倾向。',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    question: 'Agent 中 ReAct 和 Plan-and-Execute 有什么区别？',
    answer: 'ReAct 是交错式架构，每步 Thought→Action→Observation 循环，适合短任务和动态环境，但长链路容易累积误差。Plan-and-Execute 先生成完整计划再逐步执行，规划和执行解耦，适合复杂多步任务，但计划质量强依赖初始 prompt 和规划模型能力。实践中常结合使用：外层 Plan-and-Execute 控制任务分解，内层 ReAct 处理单步工具调用。',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const WEEKLY_TREND: TrendPoint[] = Array.from({ length: 7 }, (_, i) => ({
  date: daysAgo(6 - i),
  studyMinutes: [35, 50, 0, 75, 60, 90, 45][i],
  completedCount: [3, 5, 0, 8, 6, 10, 4][i],
}))

const MONTHLY_MINUTES = [
  45, 60, 30, 75, 90, 0, 55, 40, 85, 70,
  30, 60, 45, 90, 75, 50, 35, 80, 60, 45,
  70, 55, 40, 85, 90, 30, 60, 75, 50, 65,
]
const MONTHLY_COUNTS = [
  4, 6, 3, 8, 10, 0, 5, 4, 9, 7,
  3, 6, 5, 10, 8, 5, 3, 9, 6, 4,
  7, 5, 4, 9, 10, 3, 6, 8, 5, 7,
]

export const MONTHLY_TREND: TrendPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  studyMinutes: MONTHLY_MINUTES[i],
  completedCount: MONTHLY_COUNTS[i],
}))
