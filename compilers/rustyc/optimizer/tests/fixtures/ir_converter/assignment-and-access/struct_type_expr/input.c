int main() {
    struct Test {
        int value;
        int age;
    };
    struct Test a;
    struct Test b;
    a.age + 10;
    a.value + 100;
    b.value = b.age + 100;
    b.age = a.age + a.age;
    return 0;
}