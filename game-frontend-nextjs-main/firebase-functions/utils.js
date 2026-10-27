import {v5 as uuidv5, v4 as uuidv4} from "uuid";
export const USER_NAMESPACE = "a03cd036-5eab-11ed-9b6a-0242ac120002";
export const uuid = (id, type) => {
    if (!id && !type) {
        return uuidv4();
    }
    return  uuidv5(id, type);
}

