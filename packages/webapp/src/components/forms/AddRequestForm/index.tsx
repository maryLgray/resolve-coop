/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { useState } from 'react'
import cx from 'classnames'
import { Formik, Form } from 'formik'
import { Col, Row } from 'react-bootstrap'
import * as yup from 'yup'
import { FormSectionTitle } from '~components/ui/FormSectionTitle'
import { FormikSubmitButton } from '~components/ui/FormikSubmitButton'
import type { IDatePickerStyles } from '@fluentui/react'
import { Icon, DatePicker } from '@fluentui/react'
import type { StandardFC } from '~types/StandardFC'
import { ClientSelect } from '~ui/ClientSelect'
import { FormTitle } from '~ui/FormTitle'
import { SpecialistSelect } from '~ui/SpecialistSelect'
import { ActionInput } from '~ui/ActionInput'
import { TagSelect } from '~ui/TagSelect'
import { get } from 'lodash'
import { Namespace, useTranslation } from '~hooks/useTranslation'
import styles from './index.module.scss'
import { wrap, trackEvent } from '~utils/appinsights'
import { NewFormPanel } from '~components/ui/NewFormPanel'
import { useLocale } from '~hooks/useLocale'
import { useCurrentUser } from '~hooks/api/useCurrentUser'
import { useLocation } from 'react-router-dom'
import { OfflineEntityCreationNotice } from '~components/ui/OfflineEntityCreationNotice'

interface AddRequestFormProps {
	onSubmit: (form: any) => void
	showAssignSpecialist?: boolean
}

const datepickerStyles: Partial<IDatePickerStyles> = {
	root: {
		border: 0,
		padding: '0 !important'
	},
	wrapper: {
		border: 0
	},
	textField: {
		border: '1px solid var(--bs-gray-4)',
		borderRadius: '3px',
		minHeight: '35px',
		selectors: {
			'.ms-TextField-fieldGroup': {
				border: 0,
				height: '41px',
				':after': {
					outline: 0,
					border: 0
				}
			},
			span: {
				div: {
					marginTop: 0
				}
			},
			i: {
				top: '5px'
			}
		},
		':focus': {
			borderColor: 'var(--bs-primary-light)'
		},
		':active': {
			borderColor: 'var(--bs-primary-light)'
		},
		':hover': {
			borderColor: 'var(--bs-primary-light)'
		}
	}
}

export const AddRequestForm: StandardFC<AddRequestFormProps> = wrap(function AddRequestForm({
	className,
	onSubmit,
	showAssignSpecialist = true
}) {
	const { c, t } = useTranslation(Namespace.Requests)
	const { orgId } = useCurrentUser()
	const location = useLocation()
	const [locale] = useLocale()

	const AddRequestSchema = yup.object().shape({
		title: yup.string().min(2, t('addRequestYup.tooShort')).required(t('addRequestYup.required')),
		contactIds: yup.array().min(1, t('addRequestYup.required'))
	})

	const [openNewClientFormPanel, setOpenNewClientFormPanel] = useState(false)

	const handleTrackingOnSubmit = (values) => {
		// Send telemetry for creating the request
		trackEvent({
			name: 'Request Added',
			properties: {
				'Organization ID': orgId,
				Page: location?.pathname ?? '',
				'Client Count': values.contactIds.length,
				'Has Due Date': (!!values.endDate).toString(),
				'Specialist Assigned': values.userId ?? '',
				'Has Tags': (!!values?.tags).toString()
			}
		})

		// Send telemetry for each tag added to the request
		if (values?.tags) {
			values.tags.forEach((tag) => {
				trackEvent({
					name: 'Tag Applied',
					properties: {
						'Organization ID': orgId,
						'Tag ID': tag,
						'Used On': 'request'
					}
				})
			})
		}
	}

	return (
		<div className={cx(className, 'addRequestForm')}>
			<Formik
				validateOnBlur
				initialValues={{
					title: '',
					userId: null,
					contactIds: [],
					endDate: null,
					tags: null,
					description: ''
				}}
				validationSchema={AddRequestSchema}
				onSubmit={(values) => {
					const _values = {
						...values,
						title: values.title,
						tags: values.tags?.map((i) => i.value),
						userId: values.userId?.value,
						contactIds: values.contactIds?.map((i) => i.value)
					}
					onSubmit(_values)
					handleTrackingOnSubmit(_values)
				}}
			>
				{({ errors, touched, values, setFieldValue }) => {
					return (
						<>
							<NewFormPanel
								showNewFormPanel={openNewClientFormPanel}
								newFormPanelName={'addClientForm'}
								onNewFormPanelDismiss={() => setOpenNewClientFormPanel(false)}
							/>
							<Form>
								<FormTitle>{t('addRequestTitle')}</FormTitle>
								<OfflineEntityCreationNotice />
								{/* Form section with titles within columns */}
								<Row className='flex-column flex-md-row mb-4'>
									<Col className='mb-3 mb-md-0'>
										<FormSectionTitle>{t('addRequestFields.requestTitle')}</FormSectionTitle>

										<ActionInput
											name='title'
											error={get(touched, 'title') ? get(errors, 'title') : undefined}
											rows='1'
										/>
									</Col>
								</Row>
								<Row className='flex-column flex-md-row mb-0'>
									<FormSectionTitle>{t('addRequestFields.addClient')}</FormSectionTitle>
								</Row>
								<Row className='flex-row flex-nowrap mb-4'>
									<Col className='mb-3 mb-md-0' style={{ flex: '100 0 0' }}>
										<ClientSelect
											name='contactIds'
											className='requestClientSelect'
											placeholder={t('addRequestFields.addClientPlaceholder')}
											errorClassName={cx(styles.errorLabel, styles.errorLabelContactIds)}
										/>
									</Col>
									<Col className='mb-3 mb-md-0'>
										<button
											className={styles.newClientButton}
											onClick={() => setOpenNewClientFormPanel(true)}
										>
											<span>{t('requestPageTopButtons.newClientButtonName')}</span>
											<Icon iconName='CircleAdditionSolid' className={cx(styles.buttonIcon)} />
										</button>
									</Col>
								</Row>
								<Row className='flex-column flex-md-row mb-4'>
									<Col>
										<FormSectionTitle>
											{t('addRequestFields.addEndDate')} ({t('addRequestFields.optional')})
										</FormSectionTitle>

										<DatePicker
											placeholder={t('addRequestFields.addEndDatePlaceholder')}
											allowTextInput
											showMonthPickerAsOverlay={false}
											ariaLabel={c('formElements.datePickerAriaLabel')}
											value={values.endDate ? new Date(values.endDate) : null}
											onSelectDate={(date) => {
												setFieldValue('endDate', date)
											}}
											formatDate={(date) => date.toLocaleDateString(locale)}
											minDate={new Date()}
											styles={datepickerStyles}
										/>
									</Col>
								</Row>

								{/* Form section with title outside of columns */}
								{showAssignSpecialist && (
									<>
										<FormSectionTitle>
											{t('addRequestFields.assignSpecialist')} ({t('addRequestFields.optional')})
										</FormSectionTitle>

										<Row className='mb-4 pb-2'>
											<Col>
												<SpecialistSelect
													name='userId'
													className={'requestSpecialistSelect'}
													placeholder={t('addRequestFields.assignSpecialistPlaceholder')}
												/>
											</Col>
										</Row>
									</>
								)}

								<Row className='mb-4 pb-2'>
									<Col>
										<FormSectionTitle>
											{t('addRequestFields.description')} ({t('addRequestFields.optional')})
										</FormSectionTitle>

										<ActionInput
											name='description'
											error={get(touched, 'description') ? get(errors, 'description') : undefined}
										/>
									</Col>
								</Row>

								<Row className='mb-4 pb-2'>
									<Col>
										<FormSectionTitle>{t('addRequestButtons.addRequestTag')}</FormSectionTitle>

										<TagSelect name='tags' placeholder={t('addRequestFields.addTagPlaceholder')} />
									</Col>
								</Row>

								<FormikSubmitButton
									className='btnAddRequestSubmit'
									enableOffline={true}
									disabled={!touched || !values.contactIds?.length || !values.title?.length}
								>
									{t('addRequestButtons.createRequest')}
								</FormikSubmitButton>
							</Form>
						</>
					)
				}}
			</Formik>
		</div>
	)
})
