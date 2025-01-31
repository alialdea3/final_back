export const schema = `#graphql
    type Restaurant{
        id:ID!
        nombre: String!
        direccion:String!
        ciudad:String!
        telefono:String!
        temp:String!
        time:String!

    }
    type Query {
        getRestaurant(id:ID!): Restaurant
        getRestaurants(ciudad:String!):[Restaurant!]!
   }
        type Mutation{
        addRestaurant(nombre:String!, direccion:String!,ciudad:String! telefono:String!): Restaurant!
        deleteRestaurant(id:ID!):Boolean!
        }
`;
