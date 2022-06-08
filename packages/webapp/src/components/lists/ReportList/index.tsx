/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useCallback, useEffect, useState, useMemo } from 'react'
import styles from './index.module.scss'
import type { StandardFC } from '~types/StandardFC'
import { wrap, trackEvent } from '~utils/appinsights'
import { Namespace, useTranslation } from '~hooks/useTranslation'
import { useCurrentUser } from '~hooks/api/useCurrentUser'
import { useReportTypeOptions, useTopRowFilterOptions } from './hooks'
import type { ReportType } from './types'
import { empty } from '~utils/noop'
import { ReportOptions } from './ReportOptions'
import { Report } from './reports/Report'
import { useFilteredData } from './useFilteredData'
import { useCsvExport } from './useCsvExport'
import { usePrinter } from './usePrinter'
import type { IDropdownOption } from '@fluentui/react'
import { useRecoilState } from 'recoil'
import { hiddenReportFieldsState, selectedReportTypeState } from '~store'

interface ReportListProps {
	title?: string
}

export const ReportList: StandardFC<ReportListProps> = wrap(function ReportList({ title }) {
	const { t } = useTranslation(Namespace.Reporting, Namespace.Clients, Namespace.Services)

	const { orgId, preferences, updateUserPreferences } = useCurrentUser()

	const defaultHiddenFields = {
		clients: {
			notes: true,
			preferredLanguage: true,
			preferredContactMethod: true,
			preferredContactTime: true,
			street: true,
			unit: true,
			city: true,
			state: true
		},
		requests: {
			gender: true,
			dateOfBirth: true,
			race: true,
			ethnicity: true,
			preferredLanguage: true,
			preferredContactMethod: true,
			preferredContactTime: true,
			street: true,
			unit: true,
			city: true,
			county: true,
			state: true,
			zip: true,
			notes: true
		},
		services: {
			gender: true,
			dateOfBirth: true,
			race: true,
			ethnicity: true,
			preferredLanguage: true,
			preferredContactMethod: true,
			preferredContactTime: true,
			street: true,
			unit: true,
			city: true,
			county: true,
			state: true,
			zip: true,
			notes: true
		}
	}

	const preferencesObj = useMemo(() => (preferences ? JSON.parse(preferences) : {}), [preferences])

	// Data & Filtering
	const [unfilteredData, setUnfilteredData] = useState<unknown[]>(empty)
	const [filteredData, setFilteredData] = useState<unknown[]>(empty)
	const [hiddenFields, setHiddenFields] = useRecoilState(hiddenReportFieldsState)
	const {
		clearFilters,
		clearFilter,
		filterColumns,
		filterColumnTextValue,
		filterRangedValues,
		getDemographicValue,
		fieldFilters,
		setFieldFilters,
		setFilterHelper
	} = useFilteredData(unfilteredData, setFilteredData)
	// Exporting
	const { downloadCSV, setCsvFields, csvFields } = useCsvExport(filteredData)
	const { print } = usePrinter()

	// Top-row options
	const [reportType, setReportType] = useRecoilState(selectedReportTypeState)
	const reportTypeOptions = useReportTypeOptions()
	const [selectedService, reportFilterOptions] = useTopRowFilterOptions(reportType)

	const handleReportTypeChange = useCallback(
		(reportTypeNew: ReportType) => {
			if (reportTypeNew !== reportType || unfilteredData.length === 0) {
				setUnfilteredData(empty)
				setFilteredData(empty)
				setCsvFields(empty)
				setReportType(reportTypeNew)
				setHiddenFields(
					preferencesObj?.reportList
						? preferencesObj?.reportList[reportTypeNew]?.hiddenFields ?? {}
						: {}
				)
				clearFilters()
			}
		},
		[
			setUnfilteredData,
			unfilteredData,
			setFilteredData,
			setCsvFields,
			setHiddenFields,
			setReportType,
			reportType,
			preferencesObj?.reportList,
			clearFilters
		]
	)

	const handleShowFieldsChange = useCallback(
		(fieldOption: IDropdownOption) => {
			let _hiddenFields = { ...hiddenFields }
			if (!fieldOption.selected) {
				_hiddenFields = { ...hiddenFields, [fieldOption.key]: true }
				clearFilter(fieldOption.key as string)
			} else {
				_hiddenFields = { ...hiddenFields, [fieldOption.key]: false }
			}

			setHiddenFields(_hiddenFields)

			updateUserPreferences({
				...preferencesObj,
				reportList: {
					...(preferencesObj?.reportList ?? {}),
					[reportType]: {
						hiddenFields: _hiddenFields
					}
				}
			})
		},
		[setHiddenFields, hiddenFields, clearFilter, reportType, updateUserPreferences, preferencesObj]
	)

	const areFiltersApplied = useCallback(() => {
		return Object.values(hiddenFields).filter((field) => !!field).length > 0
	}, [hiddenFields])

	const handlePrint = useCallback(() => {
		const printableData = []
		const printableFields = csvFields.map((field) => field.label)

		for (const data of filteredData) {
			const printableDataItem = {}

			for (const field of csvFields) {
				printableDataItem[field.label] = field.value(data) ?? ''
			}

			printableData.push(printableDataItem)
		}

		print(printableData, printableFields, reportType, areFiltersApplied())
	}, [csvFields, filteredData, print, reportType, areFiltersApplied])

	const handleCsvExport = useCallback(() => {
		downloadCSV(reportType, areFiltersApplied())
	}, [downloadCSV, reportType, areFiltersApplied])

	const handleTrackEvent = (name: string) => {
		trackEvent({
			name,
			properties: {
				'Organization ID': orgId,
				'Data Category': reportType
			}
		})
	}

	// using useEffect as "onComponentMount" to set hidden fields after initial fetch
	useEffect(() => {
		setHiddenFields(
			preferencesObj?.reportList
				? {
						...defaultHiddenFields[reportType],
						...preferencesObj?.reportList[reportType]?.hiddenFields
				  } ?? { ...defaultHiddenFields[reportType] }
				: { ...defaultHiddenFields[reportType] }
		)
		/* eslint-disable-next-line react-hooks/exhaustive-deps*/
	}, [reportType])

	return (
		<section id='reportSection' className={styles.reportSection}>
			<ReportOptions
				title={title}
				reportOptions={reportTypeOptions}
				type={reportType}
				filterOptions={reportFilterOptions}
				reportOptionsDefaultInputValue={t('clientsTitle')}
				showExportButton={true}
				onReportOptionChange={handleReportTypeChange}
				onShowFieldsChange={handleShowFieldsChange}
				onPrintButtonClick={handlePrint}
				onExportDataButtonClick={handleCsvExport}
				numRows={filteredData.length}
				unfilteredData={unfilteredData}
				selectedService={selectedService}
				hiddenFields={hiddenFields}
			/>
			<Report
				type={reportType}
				data={filteredData}
				service={selectedService}
				hiddenFields={hiddenFields}
				setFilteredData={setFilteredData}
				setUnfilteredData={setUnfilteredData}
				setCsvFields={setCsvFields}
				onTrackEvent={handleTrackEvent}
				{...{
					filterColumns,
					filterColumnTextValue,
					filterRangedValues,
					getDemographicValue,
					fieldFilters,
					setFieldFilters,
					setFilterHelper
				}}
			/>
		</section>
	)
})
