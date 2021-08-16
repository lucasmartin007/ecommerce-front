const defaultState = {
    itemsCarrito:[],
  };
  
  export default function(state=defaultState, action = {}) {
    switch(action.type) {
      case 'UPDATE':
        return {
          ...state,
          itemsCarrito:action.itemsCarrito,
        };
      default:
        return state;
    }
  }

