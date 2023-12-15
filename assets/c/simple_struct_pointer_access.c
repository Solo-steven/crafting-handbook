int main() {
    struct Test {
        int value;
    };
    struct Test a;
    struct Test *a_p = &a;
    struct Test b;
    a_p->value = 100;
    *a_p = b; 
}