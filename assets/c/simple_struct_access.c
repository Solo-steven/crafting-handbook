int main() {
    struct Test {
        int value;
    };
    struct Test a;
    struct Test b;
    b.value = 100;
    a = b; 
}