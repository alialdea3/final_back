import { GraphQLError } from "graphql";
import { ObjectId, Collection } from "mongodb";
import {RestaurantModel, APIPhone, APIGeo, APITiempo, APITemperatura } from "./type.ts";

type getRestaurantArgs={
    id:string
}

type getRestaurantsArgs={
    ciudad:string
}

type addRestaurantArgs={
    nombre:string
    direccion:string
    ciudad:string
    telefono:string
}

type deleteRestaurantArgs={
    id:string
}

type Context={
    RestaurantesCollection: Collection<RestaurantModel>
}


export const resolvers = {
    Query: {
        getRestaurant: async (_: unknown, args: getRestaurantArgs, ctx: Context): Promise<RestaurantModel|null > => {
            return await ctx.RestaurantesCollection.findOne({_id: new ObjectId(args.id)})
        },
        getRestaurants: async(_:unknown, args:getRestaurantsArgs,ctx:Context):Promise<RestaurantModel[]>=>{
            return await ctx.RestaurantesCollection.find({ciudad:args.ciudad}).toArray();
        }
    },
    Mutation:{
        addRestaurant: async (_:unknown, args: addRestaurantArgs, ctx:Context):Promise<RestaurantModel>=>{
            const API_KEY= Deno.env.get("API_KEY")
            if (!API_KEY) throw new GraphQLError ("te falta la API_KEY bro")
            const nombre= args.nombre
            const ciudad = args.ciudad
            const direccion =args.direccion
            const telefono=args.telefono
            if(!nombre || !direccion|| !ciudad|| !telefono) throw new GraphQLError ("Te faltan cosetas")

            const telExiste= await ctx.RestaurantesCollection.countDocuments({telefono})
            if (telExiste >=1) throw new GraphQLError ("El telefono ya era de alguien")

            const url= `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`
            const data= await fetch(url,{ headers:{ 'X-Api-Key':API_KEY}})

            if (data.status!==200) throw new GraphQLError ("Errorsito con la url1")

            const response: APIPhone = await data.json()

            console.log("telefon:", response)

            if (!response.is_valid) throw new GraphQLError ("El telefono no es valido")
            
            const timezone= response.timezones[0]

            const url2=`https://api.api-ninjas.com/v1/geocoding?city=${ciudad}`
            const dataciudad= await fetch(url2,{ headers:{ 'X-Api-Key':API_KEY}})

            if (dataciudad.status!==200) throw new GraphQLError ("Errorsito con la url2")
            const responseCiudad: APIGeo = await dataciudad.json()

            console.log("response2", responseCiudad)
            const latitude= responseCiudad[0].latitude
            const longitude = responseCiudad[0].longitude

            const {insertedId} = await ctx.RestaurantesCollection.insertOne({
                nombre,
                direccion,
                ciudad,
                telefono,
                timezone,
                latitude,
                longitude
            })

            return{
                _id:insertedId,
                nombre,
                direccion,
                ciudad,
                telefono,
                timezone,
                latitude,
                longitude
            }
     
        },
        deleteRestaurant: async (_:unknown, args: deleteRestaurantArgs, ctx:Context):Promise<boolean>=>{
            const {deletedCount}= await ctx.RestaurantesCollection.deleteOne({_id:new ObjectId(args.id)})
            return deletedCount===1
        }

    },
    Restaurant:{
        id: (parent:RestaurantModel):string=>{
            if (!parent._id) throw new GraphQLError ("error el papi no tiene id D:")
            return parent._id.toString()},
        time: async (parent:RestaurantModel):Promise<string>=>{
            const API_KEY= Deno.env.get("API_KEY")
            if (!API_KEY) throw new GraphQLError ("te falta la API_KEY bro")

            const timezone = parent.timezone
            const url=`https://api.api-ninjas.com/v1/worldtime?timezone=${timezone}`

            const data= await fetch(url,{ headers:{ 'X-Api-Key':API_KEY}})

            if (data.status!==200) throw new GraphQLError ("Errorsito con la url")

            const response: APITiempo = await data.json()
            return response.datetime

        },
        temp: async(parent:RestaurantModel):Promise<string>=>{
            const API_KEY= Deno.env.get("API_KEY")
            if (!API_KEY) throw new GraphQLError ("te falta la API_KEY bro")
            
                const latitude = parent.latitude
                const longitude= parent.longitude

                console.log("parent:", parent)

                const url = `https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`

                const data= await fetch(url,{ headers:{ 'X-Api-Key':API_KEY}})

            if (data.status!==200) throw new GraphQLError ("Errorsito con la url")

            const response: APITemperatura = await data.json()
            return response.temp
        }

    }
};
