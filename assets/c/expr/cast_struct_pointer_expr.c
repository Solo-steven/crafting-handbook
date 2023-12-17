struct Wrapper {
    int value;
    int age;
};
int main() {
    struct Wrapper a;
    struct Wrapper *p;
    p = &a;
    void *void_p = (void*)p;
    struct Wrapper *other_p = (struct Wrapper*) void_p;
    other_p->value = 10;
    return 0; 
}