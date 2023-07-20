import { Tooltip, type TooltipProps } from '@chakra-ui/react'

const TooltipShell = ({ children, ...props }: TooltipProps) => {
  return (
    <Tooltip hasArrow placement='right' bg='primary' {...props}>
      {children}
    </Tooltip>
  )
}

export default TooltipShell
