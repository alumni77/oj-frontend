import request from '@/utils/request'

enum API {
  GET_CAROUSEL_URL = '/account/home-carousel',
  GET_LAST_WEEK_SUBMISSION_URL = '/account/get-last-week-submission-statistics',
  GET_RECENT_UPDATE_PROBLEM_URL = '/account/get-recent-updated-problem',
  GET_RECENT_SEVEN_ACRANK_URL = '/account/get-recent-seven-ac-rank',
}

export const GetHomeCarousel = () => request.get(API.GET_CAROUSEL_URL)

export const GetLastWeekSubmissionStatistics = () =>
  request.get(API.GET_LAST_WEEK_SUBMISSION_URL)

export const GetRecentUpdateProblem = () =>
  request.get(API.GET_RECENT_UPDATE_PROBLEM_URL)

export const GetRecentSevenACRank = () =>
  request.get(API.GET_RECENT_SEVEN_ACRANK_URL)
