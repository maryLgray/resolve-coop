/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ReactNode, ReactElement } from 'react'
import { memo } from 'react'
import { Spinner } from '@fluentui/react'
import { Col, Row } from 'react-bootstrap'
import { PaginatedList as Paginator } from 'react-paginated-list'
import cx from 'classnames'
import type { StandardComponentProps } from '~types/StandardFC'
import styles from './index.module.scss'
import { get } from 'lodash'
import { useTranslation } from '~hooks/useTranslation'
import { nullFn } from '~utils/noop'
import { usePageItems } from './hooks'
import type { IPaginatedListColumn } from './types'
import { OfflineTableNoticeOrNoResults } from '../OfflineTableNoticeOrNoResults'

export interface PaginatedDataProps<T> extends StandardComponentProps {
	data: T[]
	columns: IPaginatedListColumn[]
	hideRowBorders?: boolean
	isLoading: boolean
	isSearching: boolean
	itemsPerPage: number
	onPageChange: (items: T[], currentPage: number) => void
	overflowActive: boolean
	overflowActiveClassName?: string
	rowClassName?: string
}
export const PaginatedData = memo(function PaginatedData<T>({
	className,
	rowClassName,
	hideRowBorders = false,
	data,
	columns,
	itemsPerPage,
	isLoading,
	isSearching,
	onPageChange,
	overflowActive,
	overflowActiveClassName
}: PaginatedDataProps<T>): ReactElement {
	const { c } = useTranslation()
	const pageItems = usePageItems(itemsPerPage)
	return (
		<Paginator
			isLoading={isLoading}
			list={data}
			itemsPerPage={itemsPerPage}
			onPageChange={onPageChange}
			controlClass={cx(data.length <= itemsPerPage ? styles.noPaginator : styles.paginator)}
			loadingItem={() => {
				return (
					<div className={styles.loadingSpinner}>
						<Spinner className='waitSpinner' size={1} />
						<span>{c('paginatedList.loading')}</span>
					</div>
				)
			}}
			paginatedListContainerClass={cx(className, overflowActive ? overflowActiveClassName : null)}
			renderList={(items: T[]) => (
				<>
					{pageItems(data, items, isSearching).length > 0 ? (
						pageItems(data, items, isSearching).map((item: T, id: number) => (
							<Row
								key={id}
								className={cx(
									styles.itemRow,
									hideRowBorders ? '' : styles.itemRowBordered,
									rowClassName,
									'data-row'
								)}
							>
								{columns.map((column: any, idx: number) => renderColumnItem(column, item, idx))}
							</Row>
						))
					) : (
						<Row
							className={cx(
								styles.itemRow,
								hideRowBorders ? '' : styles.itemRowBordered,
								rowClassName
							)}
						>
							<Col className={cx(styles.columnItem, styles.noResults)}>
								<OfflineTableNoticeOrNoResults />
							</Col>
						</Row>
					)}
				</>
			)}
		/>
	)
})

function renderColumnItem(
	{ onRenderColumnItem = nullFn, className, itemClassName, fieldName }: IPaginatedListColumn,
	item,
	index
): ReactNode {
	const renderOutside = onRenderColumnItem(item, index)
	if (renderOutside) {
		return (
			<Col key={index} className={cx(styles.columnItem, className, itemClassName)}>
				{onRenderColumnItem(item, index)}
			</Col>
		)
	} else {
		if (Array.isArray(fieldName)) {
			const fieldArr = fieldName.map((field: any) => `${get(item, field, field)}`)
			return (
				<Col key={index} className={cx(styles.columnItem, className, itemClassName)}>
					{fieldArr}
				</Col>
			)
		} else {
			return (
				<Col key={index} className={cx(styles.columnItem, className, itemClassName)}>
					{get(item, fieldName, fieldName)}
				</Col>
			)
		}
	}
}
