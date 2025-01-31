import { OptionalId, ObjectId } from "mongodb";

export type RestaurantModel = OptionalId<{
    nombre: string;
    direccion:string;
    ciudad:string;
    telefono:string
    timezone:string
    latitude:string
    longitude:string
    
}>;

export type APIPhone={
    is_valid:boolean
    timezones:string
}

export type APIGeo={
    latitude:string
    longitude:string
}

export type APITiempo={
    datetime:string
}

export type APITemperatura={
    temp:string
}

