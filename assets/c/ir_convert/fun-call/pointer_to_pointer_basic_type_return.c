
int a = 10;
int *p = &a;
int** return_pointer() {
    return &p;
}

int main() {
    return_pointer();
    **return_pointer() = 10;
    **return_pointer() + 10;
    **return_pointer() = **return_pointer() + 100;
    int c = 10;
    **return_pointer() = **return_pointer() + c;
    return 0;
}