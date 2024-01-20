int main() {
    int a = 10, c = 100;
    a = c = 1000;

    struct Test {
        int value;
        int age;
    };
    struct Test aa, b, d;
    d.age = 100;
    d.value = 1000;
    aa = b = d;
    return 0;
}