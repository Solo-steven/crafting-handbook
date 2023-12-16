int main() {
    struct Test {
        int value;
        int age;
    };
    struct Test a, b;
    struct Test *p = &a;
    struct Test *pp;
    pp = &b;
    return 0;
}