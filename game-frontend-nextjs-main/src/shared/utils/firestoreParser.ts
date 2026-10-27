//@ts-ignore
const getFireStoreProp = value => {
    const props = { 'arrayValue': 1, 'bytesValue': 1, 'booleanValue': 1, 'doubleValue': 1, 'geoPointValue': 1, 'integerValue': 1, 'mapValue': 1, 'nullValue': 1, 'referenceValue': 1, 'stringValue': 1, 'timestampValue': 1 }
    //@ts-ignore
    return Object.keys(value).find(k => props[k] === 1)
  }
  
  //@ts-ignore
  export const FireStoreParser = value => {
    const prop = getFireStoreProp(value)
    if (prop === 'doubleValue' || prop === 'integerValue') {
      value = Number(value[prop])
    }
    else if (prop === 'arrayValue') {
      //@ts-ignore
      value = (value[prop] && value[prop].values || []).map(v => FireStoreParser(v))
    }
    else if (prop === 'mapValue') {
      value = FireStoreParser(value[prop] && value[prop].fields || {})
    }
    else if (prop === 'geoPointValue') {
      value = { latitude: 0, longitude: 0, ...value[prop] }
    }
    else if (prop) {
      value = value[prop]
    }
    else if (typeof value === 'object') {
      Object.keys(value).forEach(k => value[k] = FireStoreParser(value[k]))
    }
    return value;
  }
  export default FireStoreParser