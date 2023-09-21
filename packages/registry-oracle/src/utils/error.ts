export function prepareError(errMsg: string) {
    return {
      errorInformation: {
        errorCode: '3002',
        errorDescription: errMsg,
      },
    }
}
