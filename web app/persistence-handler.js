const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('./config')
const url = require('url')

const endpoint = config.endpoint
const key = config.key

class DbHandler {
    constructor() {
        this.databaseId = config.database.id
        this.containerId = config.container.id
        this.partitionKey = { kind: 'Hash', paths: ['/Country'] }
        this.client = new CosmosClient({ endpoint, key })
    }
    /**
    * Create the database if it does not exist
    */
    async createDatabase() {
        const { database } = await this.client.databases.createIfNotExists({
            id: this.databaseId
        })
        console.log(`Created database:\n${database.id}\n`)
    }

    /**
    * Read the database definition
    */
    async readDatabase() {
        const { resource: databaseDefinition } = await this.client
            .database(this.databaseId)
            .read()
        console.log(`Reading database:\n${databaseDefinition.id}\n`)
    }

    /**
    * Create the container if it does not exist
    */
    async createContainer() {
        const { container } = await this.client
            .database(this.databaseId)
            .containers.createIfNotExists(
            { id: this.containerId, partitionKey: this.partitionKey },
            { offerThroughput: 400 }
        )
        console.log(`Created container:\n${config.container.id}\n`)
    }
    
    /**
    * Read the container definition
    */
    async readContainer() {
        const { resource: containerDefinition } = await this.client
            .database(this.databaseId)
            .container(this.containerId)
            .read()
            console.log(`Reading container:\n${containerDefinition.id}\n`)
    }

    /**
    * Scale a container
    * You can scale the throughput (RU/s) of your container up and down to meet the needs of the workload. Learn more: https://aka.ms/cosmos-request-units
    */
    async scaleContainer() {
        const { resource: containerDefinition } = await this.client
        .database(this.databaseId)
        .container(this.containerId)
        .read()
        const {resources: offers} = await this.client.offers.readAll().fetchAll();
    
        const newRups = 500;
        for (var offer of offers) {
        if (containerDefinition._rid !== offer.offerResourceId)
        {
            continue;
        }
        offer.content.offerThroughput = newRups;
        const offerToReplace = this.client.offer(offer.id);
        await offerToReplace.replace(offer);
        console.log(`Updated offer to ${newRups} RU/s\n`);
        break;
        }
    }

    /**
    * Create item if it does not exist
    */
    async createItem(itemBody) {
        const { item } = await this.client
        .database(this.databaseId)
        .container(this.containerId)
        .items.upsert(itemBody)
        console.log(`Created item with id:\n${itemBody.id}\n`)
    }

    /**
    * Query the container using SQL
    */
    async queryContainer() {
        console.log(`Querying container:\n${config.container.id}`)
  
        // query to return all children in a family
        // Including the partition key value of lastName in the WHERE filter results in a more efficient query
        const querySpec = {
        query: 'SELECT * FROM root r WHERE @Hours - r.Hours <=1',
        parameters: [
            {
            name: '@Hours',
            value: (new Date).getUTCHours()
            }
        ]
        }
  
        const { resources: results } = await this.client
        .database(this.databaseId)
        .container(this.containerId)
        .items.query(querySpec)
        .fetchAll()
        return results;
    }

    /**
    * Replace the item by ID.
    */
    async replaceItem(itemBody) {
        console.log(`Replacing item:\n${itemBody.id}\n`)
        // Change property 'grade'
        itemBody.children[0].grade = 6
        const { item } = await this.client
        .database(this.databaseId)
        .container(this.containerId)
        .item(itemBody.id, itemBody.Country)
        .replace(itemBody)
    }

    /**
    * Delete the item by ID.
    */
    async deleteItem(itemBody) {
        await this.client
        .database(this.databaseId)
        .container(this.containerId)
        .item(itemBody.id, itemBody.Country)
        .delete(itemBody)
        console.log(`Deleted item:\n${itemBody.id}\n`)
    }

    /**
    * Cleanup the database and collection on completion
    */
    async cleanup() {
        await this.client.database(this.databaseId).delete()
    }

    /**
    * Exit the app with a prompt
    * @param {string} message - The message to display
    */
    exit(message) {
        console.log(message)
        console.log('Press any key to exit')
        process.stdin.setRawMode(true)
        process.stdin.resume()
        process.stdin.on('data', process.exit.bind(process, 0))
    }
}

module.exports = DbHandler;
