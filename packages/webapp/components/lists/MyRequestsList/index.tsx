/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { IColumn } from '@fluentui/react'
import { useSelector } from 'react-redux'
import CardRowTitle from '~components/ui/CardRowTitle'
import useWindowSize from '~hooks/useWindowSize'
import { getMyRequests } from '~slices/myRequestsSlice'
import IRequest, { RequestStatus } from '~types/Request'
import CardRow from '~ui/CardRow'
import DetailsList, { DetailsListProps } from '~ui/DetailsList'
import MultiActionButton from '~ui/MultiActionButton'
import ShortString from '~ui/ShortString'

export default function MyRequests({ title = 'My Requests' }: DetailsListProps): JSX.Element {
	const myRequests = useSelector(getMyRequests)
	const { isMD } = useWindowSize()
	const myRequestsColumns: IColumn[] = [
		{
			key: 'nameCol',
			name: 'Name',
			fieldName: 'fullName',
			minWidth: 200,
			maxWidth: 240,
			onRender: function onRequestRender(request: IRequest) {
				return (
					<CardRowTitle
						tag='span'
						title={request.requester.fullName}
						titleLink={`/request/${request.id}`}
					/>
				)
			}
		},
		{
			key: 'requestCol',
			name: 'Request',
			fieldName: 'request',
			isMultiline: true,
			minWidth: 300,
			onRender: function onRequestRender(request: IRequest) {
				return <ShortString text={request.request} limit={isMD ? 64 : 24} />
			}
		},
		{
			key: 'timeRemainingCol',
			name: 'Time Remaining',
			fieldName: 'timeRemaining',
			minWidth: 150
		},
		{
			key: 'statusCol',
			name: 'Status',
			fieldName: 'status',
			minWidth: 200,
			onRender: function onRequestRender(request: IRequest) {
				// TODO: String should be derived from translations data
				switch (request.status) {
					case RequestStatus.Pending:
						return 'In-Progress'
					case RequestStatus.Open:
					default:
						return 'Not Started'
				}
			}
		},
		{
			key: 'actionCol',
			name: '',
			fieldName: 'action',
			minWidth: 100,
			onRender: function actionRender() {
				return (
					<div className='w-100 d-flex justify-content-end'>
						<MultiActionButton />
					</div>
				)
			}
		}
	]

	const handleNewRequest = () => {
		console.log('new request')
	}

	return (
		<DetailsList
			title={title}
			items={myRequests}
			columns={myRequestsColumns}
			onAdd={handleNewRequest}
			onRenderRow={props => {
				// TODO: resolve this lint issue
				/* eslint-disable */
				const id = (props.item as { id: number })?.id ? props.item.id : ''
				return (
					<CardRow
						item={props}
						title='requester.fullName'
						// TODO: this should probably just be included as a link returned from the server
						// es
						titleLink={`/request/${id}`}
						body='request'
						bodyLimit={90}
						footNotes={['timeRemaining', 'status']}
						actions={[() => {}]}
					/>
				)
			}}
			addLabel='Add Request'
		/>
	)
}
