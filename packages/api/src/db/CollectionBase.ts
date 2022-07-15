/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import DataLoader from 'dataloader'
import type {
	Collection,
	FilterQuery,
	UpdateQuery,
	UpdateOneOptions,
	CollectionInsertOneOptions
} from 'mongodb'
import type { DbIdentified, DbItemListResponse, DbItemResponse, DbPaginationArgs } from './types'
type Key = string
export abstract class CollectionBase<Item extends DbIdentified> {
	private loader: DataLoader<Key, Item>

	public constructor(protected collection: Collection) {
		this.loader = new DataLoader((keys) => this._batchGet(keys), {
			cache: false
		})
	}

	/**
	 * Finds an item by id
	 * @param id The ID of the item to find
	 * @returns A DbItemResponse
	 */
	public async itemById(id: Key): Promise<DbItemResponse<Item>> {
		if (id == null) {
			throw new Error(`cannot get item by id with nullish id`)
		}
		const item = await this.loader.load(id)
		return { item }
	}

	/**
	 * Finds an item
	 * @param filter The filter criteria to apply
	 * @returns A DbitemResponse
	 */
	public async item(filter: FilterQuery<Item>): Promise<DbItemResponse<Item>> {
		const item = await this.collection.findOne(filter)
		return { item }
	}

	/**
	 * Updates a single item
	 * @param filter The filter criteria to apply
	 * @param update The update values to insert
	 * @param options Any options that might be applied to the update
	 */

	public async updateItem(
		filter: FilterQuery<Item>,
		update: UpdateQuery<Item>,
		options?: UpdateOneOptions
	): Promise<number> {
		const res = await this.collection.updateOne(filter, update, options)
		return res.modifiedCount
	}

	/**
	 * Inserts a single item
	 * @param document The document values to insert
	 * @param options Any options that might be applied to the insert
	 */
	public async insertItem(document: any, options?: CollectionInsertOneOptions): Promise<number> {
		const r = await this.collection.insertOne(document, options)
		return r.insertedCount
	}

	/**
	 * Deletes a single item
	 * @param filter The filter criteria to apply
	 */
	public async deleteItem(filter: FilterQuery<Item>): Promise<number | undefined> {
		const result = await this.collection.deleteOne(filter)
		return result.deletedCount
	}

	/**
	 * Deletes a multiple items
	 * @param filter The filter criteria to apply
	 */
	public async deleteItems(filter: FilterQuery<Item>): Promise<number | undefined> {
		const result = await this.collection.deleteMany(filter)
		return result.deletedCount
	}

	/**
	 * Finds a set of items
	 * @param pagination The pagination arguments
	 * @param filter The filter criteria to apply, optional
	 * @returns A DbListItem
	 */
	public async items(
		{ offset, limit }: DbPaginationArgs,
		query?: FilterQuery<Item>
	): Promise<DbItemListResponse<Item>> {
		const result = this.collection.find(query)
		if (offset) {
			result.skip(offset)
		}
		if (limit) {
			result.limit(limit)
		}
		const [items, totalCount] = await Promise.all([result.toArray(), this.count()])
		const numItems = items?.length ?? 0
		const more = offset ? offset + numItems < totalCount : false
		return { items, more, totalCount }
	}

	/**
	 * Count the number of items matchaing a query
	 * @param query The filter criteria to apply, optional
	 * @returns The number of items matching the criteria
	 */
	public async count(query?: FilterQuery<Item>): Promise<number> {
		return this.collection.countDocuments(query)
	}

	/**
	 * Count the number of items, with a distinct key matchaing a query
	 * @param key The distinct key to count, required
	 * @param query The filter criteria to apply, optional
	 * @returns The number of items matching the criteria
	 */
	public async distinct(key: string, query?: FilterQuery<Item>): Promise<number> {
		return (await this.collection.distinct(key, query)).length
	}

	private async _batchGet(keys: readonly Key[]): Promise<Item[]> {
		const idSet = [...keys] as any[] as string[]
		const result = await this.collection
			.find({
				id: { $in: idSet as any[] }
			})
			.toArray()
		return keys.map((k) => result.find((r) => r.id === k) as Item)
	}
}
