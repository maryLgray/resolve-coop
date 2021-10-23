/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	VoidResponse,
	MutationExecutePasswordResetArgs
} from '@cbosuite/schema/dist/provider-types'
import { Localization } from '~components'
import { TokenIssuer } from '~components/TokenIssuer'
import { UserCollection } from '~db'
import { Interactor } from '~types'
import { FailedResponse, SuccessVoidResponse } from '~utils/response'

export class ExecutePasswordResetInteractor
	implements Interactor<MutationExecutePasswordResetArgs, VoidResponse>
{
	public constructor(
		private readonly localization: Localization,
		private readonly tokenIssuer: TokenIssuer,
		private readonly users: UserCollection
	) {}

	public async execute({
		resetToken,
		newPassword
	}: MutationExecutePasswordResetArgs): Promise<VoidResponse> {
		const token = await this.tokenIssuer.verifyPasswordResetToken(resetToken)
		if (!token) {
			return new FailedResponse(this.localization.t('mutation.forgotUserPassword.invalidToken'))
		}
		const { item: user } = await this.users.itemById(token.user_id)
		if (!user) {
			return new FailedResponse(this.localization.t('mutation.forgotUserPassword.userNotFound'))
		}
		if (token == null || resetToken !== user.forgot_password_token) {
			await this.users.clearPasswordResetForUser(user)
			return new FailedResponse(
				this.localization.t('mutation.forgotUserPassword.invalidTokenExpired')
			)
		}

		await this.users.savePassword(user, newPassword)
		return new SuccessVoidResponse(this.localization.t('mutation.forgotUserPassword.success'))
	}
}