const defaultState = {
  token:"",
  itemsCarrito:[],
};

export default function(state=defaultState, action) {
  switch(action.type) {
    case 'UPDATE':
      return {
        // ...state,
        token:action.token,
        itemsCarrito:action.itemsCarrito,
      };
    default:
      return state;
  }
}

