const defaultState = {
    idUsuario:"",
  };
  
  export default function(state=defaultState, action = {}) {
    switch(action.type) {
      case 'UPDATE':
        return {
          ...state,
          idUsuario:action.idUsuario,
        };
      default:
        return state;
    }
  }

