int main() {
    struct Test {
        int value;
        int age;
    };
    struct Test a;
    struct Test b;
    struct Test *p = &a;
    struct Test *pp = &b;
    p->age + 10;
    p->value + 100;
    p->age = p->value + 1000;
    pp->value = pp->value + p->value;
    return 0;
}