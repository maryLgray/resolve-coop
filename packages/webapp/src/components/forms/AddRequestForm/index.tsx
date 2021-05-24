/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import cx from 'classnames'
import { Formik, Form } from 'formik'
import { Col, Row } from 'react-bootstrap'
import * as yup from 'yup'
import FormSectionTitle from '~components/ui/FormSectionTitle'
import FormikSubmitButton from '~components/ui/FormikSubmitButton'
import type ComponentProps from '~types/ComponentProps'
import ClientSelect from '~ui/ClientSelect'
import FormTitle from '~ui/FormTitle'
import FormikSelect from '~ui/FormikSelect'
import SpecialistSelect from '~ui/SpecialistSelect'

const AddRequestSchema = yup.object().shape({
	user: yup.string().required('Required'),
	duration: yup.string().required('Required')
})

interface AddRequestFormProps extends ComponentProps {
	title?: string
}

// TODO: move to db under organization or into a constants folder
const durations = [
	{
		value: 16,
		label: '16 hours'
	},
	{
		value: 24,
		label: '1 day'
	},
	{
		value: 168,
		label: '1 week'
	},
	{
		value: 336,
		label: '2 weeks'
	}
]

export default function AddRequestForm({ className }: AddRequestFormProps): JSX.Element {
	return (
		<div className={cx(className)}>
			<Formik
				validateOnBlur
				initialValues={{
					user: '',
					duration: '',
					specialist: ''
				}}
				validationSchema={AddRequestSchema}
				onSubmit={values => {
					console.log('Form Submit', values)
				}}
			>
				{({ errors, touched }) => {
					return (
						<>
							<Form>
								<FormTitle>New Request</FormTitle>
								{/* Form section with titles within columns */}
								<Row className='flex-column flex-md-row mb-4'>
									<Col className='mb-3 mb-md-0'>
										<FormSectionTitle>Add User</FormSectionTitle>
										{/* TODO: make this a react-select field */}
										{/* <FormikField name='user' placeholder='Enter text here...' /> */}
										<ClientSelect name='user' placeholder='Enter text here...' />
									</Col>
									<Col className='mb-3 mb-md-0'>
										<FormSectionTitle>Add Duration</FormSectionTitle>
										{/* TODO: make this a select or date picker */}
										<FormikSelect
											name='duration'
											placeholder='Enter duration here...'
											options={durations}
										/>
									</Col>
								</Row>

								{/* Form section with title outside of columns */}
								<FormSectionTitle>
									<>
										Assign Specialist <span className='text-normal'>(Optional)</span>
									</>
								</FormSectionTitle>
								<Row className='mb-4 pb-2'>
									<Col>
										<SpecialistSelect name='specialist' placeholder='Enter text here...' />
									</Col>
								</Row>

								<FormikSubmitButton>Create Request</FormikSubmitButton>
							</Form>
						</>
					)
				}}
			</Formik>
		</div>
	)
}