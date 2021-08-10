/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { memo } from 'react'
import styles from './index.module.scss'
import type ComponentProps from '~types/ComponentProps'
import { Formik, Form } from 'formik'
import FormikField from '~ui/FormikField'
import FormSectionTitle from '~components/ui/FormSectionTitle'
import * as yup from 'yup'
import { Row, Col } from 'react-bootstrap'
import cx from 'classnames'
import { useTranslation } from '~hooks/useTranslation'

interface PasswordResetRequestFormProps extends ComponentProps {
	submitMessage?: string
	passwordResetClick?: (values) => void
	goBackToLoginClick?: () => void
}

const PasswordResetRequestForm = memo(function PasswordResetRequestForm({
	submitMessage,
	passwordResetClick,
	goBackToLoginClick
}: PasswordResetRequestFormProps): JSX.Element {
	const { t } = useTranslation('passwordReset')
	const PasswordResetValidationSchema = yup.object().shape({
		email: yup.string().email().required()
	})

	return (
		<Row>
			<Formik
				initialValues={{ email: '' }}
				validationSchema={PasswordResetValidationSchema}
				onSubmit={values => passwordResetClick?.(values)}
			>
				{({ submitCount, values, errors }) => {
					return submitCount > 0 && submitMessage === null ? (
						<Col>
							<Row>
								<h2>{t('passwordResetRequestForm.resetSubmitted.text')}</h2>
								<p className='mb-5 mt-3'>{t('passwordResetRequestForm.resetInstruction.text')}</p>
							</Row>
							<Row>
								<div>
									<button
										type='button'
										className={styles.resetPasswordButton}
										onClick={() => goBackToLoginClick?.()}
									>
										{t('passwordResetRequestForm.goBackButton.text')}
									</button>
								</div>
							</Row>
						</Col>
					) : (
						<Col>
							<Row>
								<h2>{t('passwordResetRequestForm.title')}</h2>
								<p className={cx('mb-5 mt-3', styles.description)}>
									{t('passwordResetRequestForm.description')}
								</p>
							</Row>
							<Form>
								<FormSectionTitle className='mb-3'>
									<>
										{t('passwordResetRequestForm.email.text')}{' '}
										<span className='text-danger'>*</span>
									</>
								</FormSectionTitle>
								<FormikField
									name='email'
									type='email'
									placeholder={t('passwordResetRequestForm.email.placeholder')}
									className={cx(submitMessage ? 'mb-2' : 'mb-5', styles.formField)}
								/>
								{submitMessage && (
									<div className={cx('mb-5 alert alert-danger')}>{submitMessage}</div>
								)}
								<button
									type='submit'
									className={styles.resetPasswordButton}
									disabled={!values.email || !!errors.email}
								>
									{t('passwordResetRequestForm.resetButton.text')}
								</button>
								<button
									type='button'
									className={cx(styles.resetPasswordButton, styles.normalButton)}
									onClick={() => goBackToLoginClick?.()}
								>
									{t('passwordResetRequestForm.goBackButton.text')}
								</button>
							</Form>
						</Col>
					)
				}}
			</Formik>
		</Row>
	)
})
export default PasswordResetRequestForm