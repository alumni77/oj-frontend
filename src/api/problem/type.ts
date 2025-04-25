// 定义请求参数接口
export interface ProblemListParams {
  limit?: number // 每页数量
  currentPage?: number // 当前页码
  keyword?: string // 搜索关键词
  tagId?: string // 标签ID列表
  difficulty?: number // 难度级别
  oj?: string // 来源OJ
}

// 定义后端返回的数据类型
export interface Tag {
  id: number
  name: string
  color: string | null
  oj: string
  tcid: number | null
  gmtCreate: string
  gmtModified: string
}

export interface Problem {
  pid: number
  problemId: string
  title: string
  difficulty: number
  type: number
  tags: Tag[]
  total: number
  ac: number
  mle: number
  tle: number
  re: number
  pe: number
  ce: number
  wa: number
  se: number
  pa: number
  score: number | null
  // 前端本地属性
  status?: string
  acceptance?: number
  statistics?: {
    ac: number
    wa: number
    tle: number
    mle: number
    re: number
    other: number
  }
}

export interface ProblemResponse {
  records: Problem[]
  total: number
  size: number
  current: number
  pages: number
}

export interface TagCategory {
  name: string
  tags: string[]
  rawTags: Tag[]
}

// 题目实体接口定义
export interface ProblemEntity {
  id: number
  problemId: string // 题目的自定义ID 例如（HOJ-1000）
  title: string // 题目标题
  author: string // 作者
  type: number // 0为ACM,1为OI
  judgeMode: string // default,spj,interactive
  judgeCaseMode: string // default,subtask_lowest,subtask_average
  timeLimit: number // 单位ms
  memoryLimit: number // 单位mb
  stackLimit: number // 单位mb
  description: string // 描述
  input: string // 输入描述
  output: string // 输出描述
  examples: string // 题面样例
  isRemote: boolean // 是否为vj判题
  source: string // 题目来源（vj判题时例如HDU-1000的链接）
  difficulty: number // 题目难度
  hint: string // 备注,提醒
  auth: number // 默认为1公开，2为私有，3为比赛中
  ioScore: number // 当该题目为oi题目时的分数
  codeShare: boolean // 该题目对应的相关提交代码，用户是否可用分享
  spjCode: string | null // 特判程序或交互程序的代码
  spjLanguage: string | null // 特判程序或交互程序的语言
  userExtraFile: string | null // 特判程序或交互程序的额外文件
  judgeExtraFile: string | null // 特判程序或交互程序的额外文件
  isRemoveEndBlank: boolean // 是否默认去除用户代码的每行末尾空白符
  openCaseResult: boolean // 是否默认开启该题目的测试样例结果查看
  isUploadCase: boolean // 题目测试数据是否是上传的
  caseVersion: string // 题目测试数据的版本号
  modifiedUser: string // 修改题目的管理员用户名
  // isGroup: boolean; // 是否为团队内的题目
  // gid: number | null; // 团队ID
  applyPublicProgress: number | null // 申请公开的进度
  isFileIO: boolean // 是否是file io自定义输入输出文件模式
  ioReadFileName: string | null // 题目指定的file io输入文件的名称
  ioWriteFileName: string | null // 题目指定的file io输出文件的名称
  gmtCreate: string // 创建时间
  gmtModified: string // 修改时间

  // 前端可能需要的额外属性
  parsedExamples?: {
    input: string
    output: string
  }[]
  difficultyText?: string // 难度的文本表示
}

export interface ProblemCountVO {
  pid: number
  total: number
  ac: number
  mle: number
  re: number
  pe: number
  ce: number
  wa: number
  se: number
  pa: number
}

export interface ProblemInfoVO {
  problem: ProblemEntity
  tags: Tag[]
  languages: string[]
  problemCount: ProblemCountVO
  codeTemplate: {
    [key: string]: string
  }
}

export interface ProblemCountVO {
  pid: number
  total: number
  ac: number
  mle: number
  tle: number
  re: number
  pe: number
  ce: number
  wa: number
  se: number
  pa: number
}

export interface TestJudgeDTO {
  pid: number
  type: string
  code: string
  language: string
  userInput: string
  isRemoteJudge: boolean
  mode: string
}

export interface SubmitJudgeDTO {
  pid: string
  language: string
  code: string
  tid: number
  isRemote: boolean
}
