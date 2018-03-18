const THEORETICAL_MAX = 65536;
const PAGE_SIZE = 64 * 1024;
const MIN_PAGE_COUNT = 1;

/*
 * Returns the current maximum memory size for a WebAssembly module in
 * units of 64KiB pages
 */
function calculateMaxMemory(startingMaxPages) {
    // Instantiate smallest possible WebAssembly Memory object
    const memory = new WebAssembly.Memory({ initial: MIN_PAGE_COUNT });

    /*
     * Failed attempts to grow memory are MUCH faster than successful ones.
     * Starting from the maximum possible memory size and working backwards
     * seems to be the fastest way to calculate max memory
     */
    let pages = startingMaxPages;
    for(; pages > 0; pages--) {
        try {
            memory.grow(pages - MIN_PAGE_COUNT);
            // Handles a bug in Safari where Memory.prototype.grow succeeds, but memory is invalidated
            if (memory.buffer.byteLength !== pages * PAGE_SIZE) {
                return calculateMaxMemory(pages - 1);
            }
            return pages;
        } catch (e) {
            continue;
        }
    }

    return 1;
}


const calculateButton = document.querySelector('#calculate');
const resultDisplay = document.querySelector('#result');
calculateButton.addEventListener('click', function() {
    try {
        const maxMemoryInPages = calculateMaxMemory(THEORETICAL_MAX);
        const maxMemoryInKibibytes = maxMemoryInPages * 64;
        const maxMemoryInMebibytes = maxMemoryInKibibytes / 1024;
        const maxMemoryInGibibytes = maxMemoryInMebibytes / 1024;

        const maxMemoryText = maxMemoryInGibibytes > 1 ?
            maxMemoryInGibibytes + ' GiB' :
            (maxMemoryInMebibytes > 1 ?
                maxMemoryInMebibytes + ' MiB' :
                maxMemoryInKibibytes + ' KiB');

        resultDisplay.textContent = 'Your current max WebAssembly memory size is: ' + maxMemoryInPages + ' 64KiB pages OR ' + maxMemoryText
    } catch (e) {
        resultDisplay.textContent = 'Your browser does not support WebAssembly.'
    }
});