interface ErrorInformation {
  errorCode: string
  errorDescription: string
}

interface Error {
  errorInformation: ErrorInformation
}

export function prepareError (errMsg: string): Error {
  return {
    errorInformation: {
      errorCode: '3002',
      errorDescription: errMsg
    }
  }
}
