
int a = 10;

int* return_pointer() {
    return &a;
}

int main() {
    return_pointer();
    *return_pointer() = 10;
    *return_pointer() + 10;
    *return_pointer() = *return_pointer() + 100;
    int c = 10;
    *return_pointer() = *return_pointer() + c;
    return 0;
}