/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Panel as FluentPanel, PanelType } from '@fluentui/react'
import type ComponentProps from '~types/ComponentProps'
import { Engagement } from '@greenlight/schema/lib/client-types'
import NotificationPanelBody from '~ui/NotificationPanelBody'

interface NotificationPanelProps extends ComponentProps {
	openPanel?: boolean
	onDismiss?: () => void
	request?: Engagement
}

export default function NotificationPanel({
	children,
	onDismiss,
	openPanel = false,
	request
}: NotificationPanelProps): JSX.Element {
	return (
		<div>
			<FluentPanel
				isLightDismiss
				isOpen={openPanel}
				type={PanelType.medium}
				closeButtonAriaLabel='Close'
				onDismiss={onDismiss}
				styles={{
					main: {
						marginTop: 58
					},
					overlay: {
						marginTop: 58
					},
					scrollableContent: {
						overflow: 'visible'
					},
					content: {
						overflow: 'visible'
					},
					subComponentStyles: {
						closeButton: {
							root: {
								backgroundColor: '#2f9bed',
								borderRadius: '50%',
								marginRight: 20,
								width: 26,
								height: 26
							},
							rootHovered: {
								backgroundColor: '#2f9bed'
							},
							rootPressed: {
								backgroundColor: '#2f9bed'
							},
							icon: {
								color: 'white',
								fontWeight: 600
							}
						}
					}
				}}
			>
				<div>
					{/* TODO: Add loading state with fade in of content */}
					<NotificationPanelBody request={request} onClose={onDismiss} />
				</div>
			</FluentPanel>
		</div>
	)
}