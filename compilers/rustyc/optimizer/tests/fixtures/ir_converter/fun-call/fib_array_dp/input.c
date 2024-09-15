int f(int n ) {
    int array[n];
    array[0] = 0;
    array[1] = 1;
    for(int i = 2 ; i < n; ++i) {
        array[n] = array[n-1] + array[n-2];
    }
    return array[n-1];
}

int main() {
    f(10);
    return 0;
}