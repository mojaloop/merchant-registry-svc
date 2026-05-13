import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, expect } from 'vitest'

import '@testing-library/jest-dom'

expect.extend(matchers)

beforeAll(() => {
  // Create a container element for Chakra UI portals
  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', 'chakra-portal-root')
  document.body.appendChild(portalRoot)
})

afterEach(() => {
  cleanup()
})
