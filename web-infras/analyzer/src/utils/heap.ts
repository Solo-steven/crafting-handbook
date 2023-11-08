/**
 * This module implement the min heap for BFS traversal
 * control flow graph.
 * @param {(a: T, b: T) => number} compare
 */
function createMinHeap<T>(compare: (a: T, b: T) => number) {

    const heap: Array<T> = [];
    /**
     * Swap current index a and index b in heap.
     * @param a 
     * @param b 
     */
    function swap(a: number, b: number) {
        const temp = heap[a];
        heap[a] = heap[b];
        heap[b] = temp; 
    }
    /**
     * Push a element to heap
     * @param {T} value  
     */
    function push(value: T) {
        heap.push(value);
        let current = heap.length-1;
        let parent = Math.floor((current -1) /2);
        while(current > 0) {
            const currentNode = heap[current];
            const parentNode = heap[parent];
            if(compare(currentNode, parentNode) <= 0) {
                break;
            }
            swap(parent, current);
            current = parent;
            parent = Math.floor(current /2);
        }
    }
    function pop(): T | undefined {
        const head = heap[0];
        heap[0] = heap[length-1];
        heap.pop();

        
        return head;
    }

    return { push, pop }
}