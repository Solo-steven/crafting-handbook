int b = 10 + 100;
int *p = &b;

struct Wrapper {
    int value;
    int age;
    int *global;
};
struct Wrapper test() {
    struct Wrapper g;
    g.global = &b;
    return g;
}
int main() {
    *test().global = 10;
    b = b + 100;
    return 0;
}