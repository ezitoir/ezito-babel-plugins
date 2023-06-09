const babel = require('@babel/core');
const getProgram = require('ezito-babel/utils/get-program');

const isFunctionDefined = require('ezito-babel/utils/is-function-defined');
const reverse = require('./reverse');
module.exports = function ( template , nodePath , opts = Object , parent = undefined ){ 
    const { node } = getProgram(nodePath);
    return Object.entries(reverse(opts)).map(function([ key , value ]){
        if(!(value instanceof Function ) && typeof value !== "function" && value.constructor !== Function.prototype.constructor ) return false;
        const fn_string = value.toString();

        let new_fn_template = undefined;
        let name = undefined;
        let params = undefined;
        let body = undefined;

        babel.transformSync('function ' + fn_string , {
            plugins : [
                [function(){
                    return {
                        visitor : {
                            FunctionDeclaration(path){
                                const { node } = path;
                                name =  node.id.name;
                                params =  node.params;
                                body = template.blockStatement( node.body.body ) || node.body ; 
                                new_fn_template = template.functionDeclaration( 
                                    template.identifier(name),
                                    params, 
                                    body
                                );
                            }
                        }
                    }
                },]
            ]
        });
        
        if(isFunctionDefined( name , parent || node )) return  false;
        return new_fn_template;
    });
}