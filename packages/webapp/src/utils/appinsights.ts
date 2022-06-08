/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { withAITracking, ReactPlugin } from '@microsoft/applicationinsights-react-js'
import type { ComponentType } from 'react'
import { memo } from 'react'
import { config } from '~utils/config'

const enableDebug = config.applicationInsights.debug || false
const instrumentationKey = config.applicationInsights.key || ''
const disableTelemetry = !instrumentationKey

export const reactPlugin = new ReactPlugin()
export const appInsights = new ApplicationInsights({
	config: {
		enableDebug,
		disableTelemetry,
		instrumentationKey,
		extensions: [reactPlugin],
		extensionConfig: {
			[reactPlugin.identifier]: {
				/* */
			}
		}
	}
})
appInsights.loadAppInsights()

export function setTelemetryTracking(isDisabled: boolean) {
	appInsights.config.disableTelemetry = isDisabled
}

export function wrap<T extends ComponentType<unknown>>(
	component: T,
	componentName?: string,
	className?: string
): T {
	return withAITracking(reactPlugin, memo(component), componentName, className) as any as T
}

export function isTelemetryEnabled() {
	return !disableTelemetry
}

// Send trackEvent without sharing the whole AppInsight config
type trackEventArgs = {
	name: string
	properties?: Record<string, any>
}

export function trackEvent(args: trackEventArgs) {
	appInsights.trackEvent(args)
}
