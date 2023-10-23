// Is await as Id of function name of function declaration is deps on parent scope,
// not current scope, as long as parent is not async, no matter current is async
// or not, it should be ok.
// - when parent not async, current not async -> await can be name of function declar 
// - when parent not async, current is async  -> await can be name of function declar (this test case)
// - when parent is async, current not async  -> await can not be name of function declar
// - when parent is async, current is async   -> await can not be name of function declar
function parent() {
    async function await() {
    
    }
}