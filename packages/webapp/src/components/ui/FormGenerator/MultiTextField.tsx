/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import {
	ServiceAnswers,
	ServiceCustomField,
	ServiceCustomFieldValue
} from '@cbosuite/schema/dist/client-types'
import { TextField } from '@fluentui/react'
import React, { FC } from 'react'
import { FormFieldManager } from './FormFieldManager'
import { fieldStyles } from './styles'

// currently not used
export const MultiTextField: FC<{
	editMode: boolean
	mgr: FormFieldManager
	field: ServiceCustomField
	record: ServiceAnswers
	onChange: (submitEnabled: boolean) => void
}> = function MultiTextField({ editMode, mgr, field, record, onChange }) {
	return (
		<>
			{field?.fieldValue.map((value: ServiceCustomFieldValue) => {
				return (
					<TextField
						className='mb-3'
						key={value.id}
						label={value.label}
						required={field.fieldRequirements === 'required'}
						onBlur={(e) => {
							mgr.saveFieldValue(field, e.target.value)
							onChange(mgr.isSubmitEnabled())
						}}
						styles={fieldStyles.textField}
					/>
				)
			})}
		</>
	)
}
