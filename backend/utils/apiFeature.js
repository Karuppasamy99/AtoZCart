class ApiFeature{
    constructor(query,queryStr){
        this.query = query
        this.queryStr = queryStr
    }
    search(){
        let keyword= this.queryStr.keyword? {
            name : {
                $regex : this.queryStr.keyword,
                $options: 'i'
            }
        } : {}

        this.query.find({...keyword})
        return this
    }

    filter(){
        const queryStrCopy = {...this.queryStr}
        const removeFields = ['keyword','page','limit']
        removeFields.forEach( field => delete queryStrCopy[field])
        let queryStr = JSON.stringify(queryStrCopy)
        queryStr= queryStr.replace(/\b(gt|gte|lt|lte)/g, match => `$${match}`) 
        this.query.find(JSON.parse(queryStr))
        return this
    }

    paginate(resPerPage){
        let currentPage= Number(this.queryStr.page) || 1
        let skip = resPerPage * (currentPage-1)
        this.query.limit(resPerPage).skip(skip)
        return this

    }
}

module.exports = ApiFeature