/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { FontIcon } from '@fluentui/react'
import cx from 'classnames'
import styles from './index.module.scss'
import type ComponentProps from '~types/ComponentProps'

export interface IMultiActionButtons<T> {
	name: string
	iconOnly?: boolean
	className?: string
	iconNameLeft?: string
	iconNameRight?: string
	onActionClick?: (columnItem: T, actionName: string) => void
}

interface MultiActionButtonProps<T> extends ComponentProps {
	columnItem?: T
	buttonGroup: IMultiActionButtons<T>[]
}

export default function MultiActionButton<T>({
	columnItem,
	buttonGroup
}: MultiActionButtonProps<T>): JSX.Element {
	return (
		<>
			{buttonGroup?.map((btn, idx) => {
				return (
					<button
						key={idx}
						className={cx(
							'btn btn-primary d-flex justify-content-center align-items-center',
							styles.multiActionButton,
							btn.className
						)}
						onClick={() => btn.onActionClick?.(columnItem, btn.name)}
					>
						{btn?.iconNameLeft && (
							<FontIcon iconName={btn.iconNameLeft} className={cx(styles.iconLeft)} />
						)}
						<span>{btn.name}</span>
						{btn?.iconNameRight && (
							<FontIcon iconName={btn.iconNameRight} className={cx(styles.iconRight)} />
						)}
					</button>
				)
			})}
		</>
	)
}