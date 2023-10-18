(module
  (type (;0;) (func (param i32 i32)))
  (type (;1;) (func (param i32 i32 i32) (result i32)))
  (type (;2;) (func (param i32 i32) (result i32)))
  (type (;3;) (func (param i32)))
  (type (;4;) (func (param i32 i32 i32)))
  (type (;5;) (func (param i32 i32 i32 i32) (result i32)))
  (type (;6;) (func (param i32 i32 i32 i32)))
  (type (;7;) (func (param i32) (result i32)))
  (type (;8;) (func))
  (type (;9;) (func (param i32 i32 i32 i32 i32)))
  (type (;10;) (func (result i32)))
  (type (;11;) (func (param i32 i32 i32 i32 i32) (result i32)))
  (type (;12;) (func (param i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;13;) (func (param i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;14;) (func (param i64 i32 i32) (result i32)))
  (import "env" "log_number" (func $log_number (type 3)))
  (import "env" "js_function" (func $js_function (type 0)))
  (func $_ZN5alloc6string6String6as_str17h91520fda16fb8986E (type 0) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 64
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    local.get 1
    i32.store offset=16
    local.get 4
    i32.load offset=16
    local.set 5
    local.get 4
    local.get 5
    i32.store offset=20
    local.get 4
    i32.load offset=16
    local.set 6
    local.get 4
    local.get 6
    i32.store offset=24
    local.get 4
    i32.load offset=16
    local.set 7
    local.get 4
    local.get 7
    i32.store offset=28
    local.get 1
    i32.load
    local.set 8
    local.get 4
    local.get 8
    i32.store offset=40
    local.get 4
    local.get 8
    i32.store offset=44
    local.get 1
    i32.load offset=8
    local.set 9
    local.get 4
    local.get 9
    i32.store offset=48
    local.get 4
    local.get 8
    i32.store offset=52
    local.get 4
    local.get 8
    i32.store offset=8
    local.get 4
    local.get 9
    i32.store offset=12
    local.get 4
    i32.load offset=8
    local.set 10
    local.get 4
    i32.load offset=12
    local.set 11
    local.get 4
    local.get 10
    i32.store
    local.get 4
    local.get 11
    i32.store offset=4
    local.get 4
    i32.load
    local.set 12
    local.get 4
    i32.load offset=4
    local.set 13
    local.get 4
    local.get 12
    i32.store offset=56
    local.get 4
    local.get 13
    i32.store offset=60
    local.get 0
    local.get 13
    i32.store offset=4
    local.get 0
    local.get 12
    i32.store
    return)
  (func $_ZN76_$LT$alloc..string..String$u20$as$u20$core..convert..From$LT$$RF$str$GT$$GT$4from17hc94bf98bf1a22002E (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i64 i64 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 160
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    global.set $__stack_pointer
    local.get 5
    local.get 1
    i32.store offset=88
    local.get 5
    local.get 2
    i32.store offset=92
    i32.const 72
    local.set 6
    local.get 5
    local.get 6
    i32.add
    local.set 7
    local.get 7
    local.set 8
    local.get 5
    local.get 8
    i32.store offset=100
    i32.const 72
    local.set 9
    local.get 5
    local.get 9
    i32.add
    local.set 10
    local.get 10
    local.set 11
    local.get 5
    local.get 11
    i32.store offset=104
    i32.const 72
    local.set 12
    local.get 5
    local.get 12
    i32.add
    local.set 13
    local.get 13
    local.set 14
    local.get 5
    local.get 14
    i32.store offset=108
    i32.const 72
    local.set 15
    local.get 5
    local.get 15
    i32.add
    local.set 16
    local.get 16
    local.set 17
    local.get 5
    local.get 17
    i32.store offset=112
    i32.const 72
    local.set 18
    local.get 5
    local.get 18
    i32.add
    local.set 19
    local.get 19
    local.set 20
    local.get 5
    local.get 20
    i32.store offset=116
    local.get 5
    local.get 1
    i32.store offset=128
    local.get 5
    local.get 2
    i32.store offset=132
    local.get 5
    local.get 2
    i32.store offset=136
    i32.const 0
    local.set 21
    i32.const 8
    local.set 22
    local.get 5
    local.get 22
    i32.add
    local.set 23
    local.get 23
    local.get 2
    local.get 21
    call $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$11allocate_in17he932747a052923beE
    local.get 5
    i32.load offset=12
    local.set 24
    local.get 5
    i32.load offset=8
    local.set 25
    local.get 5
    local.get 25
    i32.store offset=72
    local.get 5
    local.get 24
    i32.store offset=76
    i32.const 0
    local.set 26
    local.get 5
    local.get 26
    i32.store offset=80
    local.get 5
    local.get 1
    i32.store offset=140
    local.get 5
    i32.load offset=72
    local.set 27
    local.get 5
    local.get 27
    i32.store offset=144
    local.get 5
    local.get 27
    i32.store offset=148
    local.get 5
    local.get 2
    i32.store offset=152
    i32.const 0
    local.set 28
    local.get 2
    local.get 28
    i32.shl
    local.set 29
    local.get 27
    local.get 1
    local.get 29
    call $memcpy
    drop
    local.get 5
    local.get 2
    i32.store offset=156
    local.get 5
    local.get 2
    i32.store offset=80
    i32.const 8
    local.set 30
    i32.const 56
    local.set 31
    local.get 5
    local.get 31
    i32.add
    local.set 32
    local.get 32
    local.get 30
    i32.add
    local.set 33
    i32.const 72
    local.set 34
    local.get 5
    local.get 34
    i32.add
    local.set 35
    local.get 35
    local.get 30
    i32.add
    local.set 36
    local.get 36
    i32.load
    local.set 37
    local.get 33
    local.get 37
    i32.store
    local.get 5
    i64.load offset=72
    local.set 38
    local.get 5
    local.get 38
    i64.store offset=56
    local.get 5
    i64.load offset=56
    local.set 39
    local.get 0
    local.get 39
    i64.store align=4
    i32.const 8
    local.set 40
    local.get 0
    local.get 40
    i32.add
    local.set 41
    i32.const 56
    local.set 42
    local.get 5
    local.get 42
    i32.add
    local.set 43
    local.get 43
    local.get 40
    i32.add
    local.set 44
    local.get 44
    i32.load
    local.set 45
    local.get 41
    local.get 45
    i32.store
    i32.const 160
    local.set 46
    local.get 5
    local.get 46
    i32.add
    local.set 47
    local.get 47
    global.set $__stack_pointer
    return)
  (func $_ZN4core3str6traits54_$LT$impl$u20$core..cmp..PartialEq$u20$for$u20$str$GT$2eq17h920cbdd34467a2f7E (type 5) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 4
    i32.const 48
    local.set 5
    local.get 4
    local.get 5
    i32.sub
    local.set 6
    local.get 6
    global.set $__stack_pointer
    local.get 6
    local.get 0
    i32.store
    local.get 6
    local.get 1
    i32.store offset=4
    local.get 6
    local.get 2
    i32.store offset=8
    local.get 6
    local.get 3
    i32.store offset=12
    local.get 6
    local.get 0
    i32.store offset=16
    local.get 6
    local.get 1
    i32.store offset=20
    i32.const 16
    local.set 7
    local.get 6
    local.get 7
    i32.add
    local.set 8
    local.get 8
    local.set 9
    local.get 6
    local.get 9
    i32.store offset=28
    local.get 6
    local.get 2
    i32.store offset=32
    local.get 6
    local.get 3
    i32.store offset=36
    i32.const 32
    local.set 10
    local.get 6
    local.get 10
    i32.add
    local.set 11
    local.get 11
    local.set 12
    local.get 6
    local.get 12
    i32.store offset=44
    local.get 0
    local.get 1
    local.get 2
    local.get 3
    call $_ZN73_$LT$$u5b$A$u5d$$u20$as$u20$core..slice..cmp..SlicePartialEq$LT$B$GT$$GT$5equal17h3ba581bac4c8e761E
    local.set 13
    i32.const 1
    local.set 14
    local.get 13
    local.get 14
    i32.and
    local.set 15
    i32.const 48
    local.set 16
    local.get 6
    local.get 16
    i32.add
    local.set 17
    local.get 17
    global.set $__stack_pointer
    local.get 15
    return)
  (func $_ZN4core5slice3raw14from_raw_parts17h69c280e81ddab2e3E (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 32
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    local.get 1
    i32.store offset=20
    local.get 5
    local.get 2
    i32.store offset=24
    local.get 5
    local.get 1
    i32.store offset=28
    local.get 5
    local.get 1
    i32.store offset=8
    local.get 5
    local.get 2
    i32.store offset=12
    local.get 5
    i32.load offset=8
    local.set 6
    local.get 5
    i32.load offset=12
    local.set 7
    local.get 5
    local.get 6
    i32.store
    local.get 5
    local.get 7
    i32.store offset=4
    local.get 5
    i32.load
    local.set 8
    local.get 5
    i32.load offset=4
    local.set 9
    local.get 0
    local.get 9
    i32.store offset=4
    local.get 0
    local.get 8
    i32.store
    return)
  (func $_ZN4core3str21_$LT$impl$u20$str$GT$3len17ha1074d3a3c73594cE (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 16
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    local.get 0
    i32.store offset=8
    local.get 4
    local.get 1
    i32.store offset=12
    local.get 1
    return)
  (func $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$11allocate_in17he932747a052923beE (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 176
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    global.set $__stack_pointer
    local.get 2
    local.set 6
    local.get 5
    local.get 6
    i32.store8 offset=39
    local.get 5
    local.get 1
    i32.store offset=124
    i32.const 0
    local.set 7
    i32.const 1
    local.set 8
    local.get 7
    local.get 8
    i32.and
    local.set 9
    block  ;; label = @1
      block  ;; label = @2
        local.get 9
        br_if 0 (;@2;)
        i32.const 0
        local.set 10
        local.get 1
        local.set 11
        local.get 10
        local.set 12
        local.get 11
        local.get 12
        i32.eq
        local.set 13
        i32.const 1
        local.set 14
        local.get 13
        local.get 14
        i32.and
        local.set 15
        local.get 5
        local.get 15
        i32.store8 offset=63
        br 1 (;@1;)
      end
      i32.const 1
      local.set 16
      local.get 5
      local.get 16
      i32.store8 offset=63
    end
    local.get 5
    i32.load8_u offset=63
    local.set 17
    i32.const 1
    local.set 18
    local.get 17
    local.get 18
    i32.and
    local.set 19
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 19
                  br_if 0 (;@7;)
                  i32.const 1
                  local.set 20
                  local.get 5
                  local.get 20
                  i32.store offset=132
                  i32.const 24
                  local.set 21
                  local.get 5
                  local.get 21
                  i32.add
                  local.set 22
                  local.get 22
                  local.get 20
                  local.get 20
                  local.get 1
                  call $_ZN4core5alloc6layout6Layout5array5inner17h60c4dfd3d8f8c73eE
                  local.get 5
                  i32.load offset=24
                  local.set 23
                  local.get 5
                  i32.load offset=28
                  local.set 24
                  local.get 5
                  local.get 24
                  i32.store offset=68
                  local.get 5
                  local.get 23
                  i32.store offset=64
                  local.get 5
                  i32.load offset=64
                  local.set 25
                  i32.const 1
                  local.set 26
                  i32.const 0
                  local.set 27
                  local.get 27
                  local.get 26
                  local.get 25
                  select
                  local.set 28
                  local.get 28
                  i32.eqz
                  br_if 1 (;@6;)
                  br 2 (;@5;)
                end
                i32.const 1
                local.set 29
                local.get 5
                local.get 29
                i32.store offset=168
                i32.const 1
                local.set 30
                local.get 5
                local.get 30
                i32.store offset=172
                i32.const 1
                local.set 31
                local.get 5
                local.get 31
                i32.store offset=100
                local.get 5
                i32.load offset=100
                local.set 32
                local.get 5
                local.get 32
                i32.store offset=96
                local.get 5
                i32.load offset=96
                local.set 33
                local.get 5
                local.get 33
                i32.store offset=48
                i32.const 0
                local.set 34
                local.get 5
                local.get 34
                i32.store offset=52
                br 5 (;@1;)
              end
              local.get 5
              i32.load offset=64
              local.set 35
              local.get 5
              i32.load offset=68
              local.set 36
              local.get 5
              local.get 35
              i32.store offset=136
              local.get 5
              local.get 36
              i32.store offset=140
              i32.const 136
              local.set 37
              local.get 5
              local.get 37
              i32.add
              local.set 38
              local.get 38
              local.set 39
              local.get 5
              local.get 39
              i32.store offset=144
              local.get 5
              local.get 36
              i32.store offset=148
              i32.const 2147483647
              local.set 40
              local.get 36
              local.set 41
              local.get 40
              local.set 42
              local.get 41
              local.get 42
              i32.gt_u
              local.set 43
              i32.const 1
              local.set 44
              local.get 43
              local.get 44
              i32.and
              local.set 45
              local.get 45
              br_if 2 (;@3;)
              br 1 (;@4;)
            end
            call $_ZN5alloc7raw_vec17capacity_overflow17h9db66c34eec3373bE
            unreachable
          end
          i32.const -2147483647
          local.set 46
          local.get 5
          local.get 46
          i32.store offset=72
          br 1 (;@2;)
        end
        i32.const 0
        local.set 47
        local.get 5
        local.get 47
        i32.store offset=112
        local.get 5
        i32.load offset=112
        local.set 48
        local.get 5
        i32.load offset=116
        local.set 49
        local.get 5
        local.get 48
        i32.store offset=104
        local.get 5
        local.get 49
        i32.store offset=108
        local.get 5
        i32.load offset=104
        local.set 50
        local.get 5
        i32.load offset=108
        local.set 51
        local.get 5
        local.get 50
        i32.store offset=72
        local.get 5
        local.get 51
        i32.store offset=76
      end
      local.get 5
      i32.load offset=72
      local.set 52
      i32.const -2147483647
      local.set 53
      local.get 52
      local.set 54
      local.get 53
      local.set 55
      local.get 54
      local.get 55
      i32.eq
      local.set 56
      i32.const 0
      local.set 57
      i32.const 1
      local.set 58
      i32.const 1
      local.set 59
      local.get 56
      local.get 59
      i32.and
      local.set 60
      local.get 57
      local.get 58
      local.get 60
      select
      local.set 61
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 61
              br_if 0 (;@5;)
              local.get 5
              i32.load8_u offset=39
              local.set 62
              i32.const 1
              local.set 63
              local.get 62
              local.get 63
              i32.and
              local.set 64
              local.get 64
              i32.eqz
              br_if 1 (;@4;)
              br 2 (;@3;)
            end
            call $_ZN5alloc7raw_vec17capacity_overflow17h9db66c34eec3373bE
            unreachable
          end
          i32.const 8
          local.set 65
          local.get 5
          local.get 65
          i32.add
          local.set 66
          i32.const 40
          local.set 67
          local.get 5
          local.get 67
          i32.add
          local.set 68
          local.get 66
          local.get 68
          local.get 35
          local.get 36
          call $_ZN63_$LT$alloc..alloc..Global$u20$as$u20$core..alloc..Allocator$GT$8allocate17h3a5ac31c568f2c4fE
          local.get 5
          i32.load offset=8
          local.set 69
          local.get 5
          i32.load offset=12
          local.set 70
          local.get 5
          local.get 70
          i32.store offset=84
          local.get 5
          local.get 69
          i32.store offset=80
          br 1 (;@2;)
        end
        i32.const 16
        local.set 71
        local.get 5
        local.get 71
        i32.add
        local.set 72
        i32.const 40
        local.set 73
        local.get 5
        local.get 73
        i32.add
        local.set 74
        local.get 72
        local.get 74
        local.get 35
        local.get 36
        call $_ZN63_$LT$alloc..alloc..Global$u20$as$u20$core..alloc..Allocator$GT$15allocate_zeroed17hc930a39b4481a697E
        local.get 5
        i32.load offset=16
        local.set 75
        local.get 5
        i32.load offset=20
        local.set 76
        local.get 5
        local.get 76
        i32.store offset=84
        local.get 5
        local.get 75
        i32.store offset=80
      end
      local.get 5
      i32.load offset=80
      local.set 77
      i32.const 1
      local.set 78
      i32.const 0
      local.set 79
      local.get 79
      local.get 78
      local.get 77
      select
      local.set 80
      block  ;; label = @2
        local.get 80
        br_if 0 (;@2;)
        local.get 5
        i32.load offset=80
        local.set 81
        local.get 5
        i32.load offset=84
        local.set 82
        local.get 5
        local.get 81
        i32.store offset=152
        local.get 5
        local.get 82
        i32.store offset=156
        local.get 5
        local.get 81
        i32.store offset=160
        local.get 5
        local.get 81
        i32.store offset=92
        local.get 5
        i32.load offset=92
        local.set 83
        local.get 5
        local.get 83
        i32.store offset=164
        local.get 5
        local.get 83
        i32.store offset=120
        local.get 5
        i32.load offset=120
        local.set 84
        local.get 5
        local.get 84
        i32.store offset=88
        local.get 5
        i32.load offset=88
        local.set 85
        local.get 5
        local.get 85
        i32.store offset=48
        local.get 5
        local.get 1
        i32.store offset=52
        br 1 (;@1;)
      end
      local.get 35
      local.get 36
      call $_ZN5alloc5alloc18handle_alloc_error17hda4b1b4e18f53a00E
      unreachable
    end
    local.get 5
    i32.load offset=48
    local.set 86
    local.get 5
    i32.load offset=52
    local.set 87
    local.get 0
    local.get 87
    i32.store offset=4
    local.get 0
    local.get 86
    i32.store
    i32.const 176
    local.set 88
    local.get 5
    local.get 88
    i32.add
    local.set 89
    local.get 89
    global.set $__stack_pointer
    return)
  (func $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$14current_memory17h62f8a4c2dd663524E (type 0) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i64 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 112
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    local.get 1
    i32.store offset=52
    i32.const 0
    local.set 5
    i32.const 1
    local.set 6
    local.get 5
    local.get 6
    i32.and
    local.set 7
    block  ;; label = @1
      block  ;; label = @2
        local.get 7
        br_if 0 (;@2;)
        local.get 1
        i32.load offset=4
        local.set 8
        i32.const 0
        local.set 9
        local.get 8
        local.set 10
        local.get 9
        local.set 11
        local.get 10
        local.get 11
        i32.eq
        local.set 12
        i32.const 1
        local.set 13
        local.get 12
        local.get 13
        i32.and
        local.set 14
        local.get 4
        local.get 14
        i32.store8 offset=15
        br 1 (;@1;)
      end
      i32.const 1
      local.set 15
      local.get 4
      local.get 15
      i32.store8 offset=15
    end
    local.get 4
    i32.load8_u offset=15
    local.set 16
    i32.const 1
    local.set 17
    local.get 16
    local.get 17
    i32.and
    local.set 18
    block  ;; label = @1
      block  ;; label = @2
        local.get 18
        br_if 0 (;@2;)
        i32.const 1
        local.set 19
        local.get 4
        local.get 19
        i32.store offset=80
        i32.const 1
        local.set 20
        local.get 4
        local.get 20
        i32.store offset=84
        local.get 1
        i32.load offset=4
        local.set 21
        local.get 4
        local.get 21
        i32.store offset=88
        i32.const 0
        local.set 22
        local.get 21
        local.get 22
        i32.shl
        local.set 23
        local.get 4
        local.get 23
        i32.store offset=92
        local.get 4
        local.get 23
        i32.store offset=20
        i32.const 1
        local.set 24
        local.get 4
        local.get 24
        i32.store offset=16
        local.get 1
        i32.load
        local.set 25
        local.get 4
        local.get 25
        i32.store offset=96
        local.get 4
        local.get 25
        i32.store offset=100
        local.get 4
        local.get 25
        i32.store offset=44
        local.get 4
        i32.load offset=44
        local.set 26
        local.get 4
        local.get 26
        i32.store offset=104
        local.get 4
        local.get 26
        i32.store offset=48
        local.get 4
        i32.load offset=48
        local.set 27
        local.get 4
        local.get 27
        i32.store offset=108
        local.get 4
        local.get 27
        i32.store offset=40
        local.get 4
        i32.load offset=40
        local.set 28
        local.get 4
        local.get 28
        i32.store offset=24
        local.get 4
        i32.load offset=16
        local.set 29
        local.get 4
        i32.load offset=20
        local.set 30
        local.get 4
        local.get 29
        i32.store offset=28
        local.get 4
        local.get 30
        i32.store offset=32
        local.get 4
        i64.load offset=24
        local.set 31
        local.get 0
        local.get 31
        i64.store align=4
        i32.const 8
        local.set 32
        local.get 0
        local.get 32
        i32.add
        local.set 33
        i32.const 24
        local.set 34
        local.get 4
        local.get 34
        i32.add
        local.set 35
        local.get 35
        local.get 32
        i32.add
        local.set 36
        local.get 36
        i32.load
        local.set 37
        local.get 33
        local.get 37
        i32.store
        br 1 (;@1;)
      end
      i32.const 0
      local.set 38
      local.get 0
      local.get 38
      i32.store offset=4
    end
    return)
  (func $_ZN4core5alloc6layout6Layout15from_size_align17hcfbacc80ae867622E (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 48
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    local.get 1
    i32.store offset=32
    local.get 5
    local.get 2
    i32.store offset=36
    local.get 2
    i32.popcnt
    local.set 6
    local.get 5
    local.get 6
    i32.store offset=40
    local.get 5
    i32.load offset=40
    local.set 7
    i32.const 1
    local.set 8
    local.get 7
    local.set 9
    local.get 8
    local.set 10
    local.get 9
    local.get 10
    i32.eq
    local.set 11
    i32.const -1
    local.set 12
    local.get 11
    local.get 12
    i32.xor
    local.set 13
    i32.const 1
    local.set 14
    local.get 13
    local.get 14
    i32.and
    local.set 15
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 15
              br_if 0 (;@5;)
              local.get 5
              local.get 2
              i32.store offset=44
              local.get 5
              local.get 2
              i32.store offset=28
              local.get 5
              i32.load offset=28
              local.set 16
              i32.const 1
              local.set 17
              local.get 16
              local.get 17
              i32.sub
              local.set 18
              i32.const 2147483647
              local.set 19
              local.get 19
              local.get 18
              i32.sub
              local.set 20
              local.get 1
              local.set 21
              local.get 20
              local.set 22
              local.get 21
              local.get 22
              i32.gt_u
              local.set 23
              i32.const 1
              local.set 24
              local.get 23
              local.get 24
              i32.and
              local.set 25
              local.get 25
              br_if 2 (;@3;)
              br 1 (;@4;)
            end
            i32.const 0
            local.set 26
            local.get 5
            local.get 26
            i32.store offset=8
            br 3 (;@1;)
          end
          local.get 5
          local.get 1
          i32.store offset=20
          local.get 5
          local.get 2
          i32.store offset=16
          local.get 5
          i32.load offset=16
          local.set 27
          local.get 5
          i32.load offset=20
          local.set 28
          local.get 5
          local.get 27
          i32.store offset=8
          local.get 5
          local.get 28
          i32.store offset=12
          br 1 (;@2;)
        end
        i32.const 0
        local.set 29
        local.get 5
        local.get 29
        i32.store offset=8
      end
    end
    local.get 5
    i32.load offset=8
    local.set 30
    local.get 5
    i32.load offset=12
    local.set 31
    local.get 0
    local.get 31
    i32.store offset=4
    local.get 0
    local.get 30
    i32.store
    return)
  (func $_ZN4core5alloc6layout6Layout5array5inner17h60c4dfd3d8f8c73eE (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 4
    i32.const 64
    local.set 5
    local.get 4
    local.get 5
    i32.sub
    local.set 6
    local.get 6
    global.set $__stack_pointer
    local.get 6
    local.get 1
    i32.store offset=44
    local.get 6
    local.get 2
    i32.store offset=48
    local.get 6
    local.get 3
    i32.store offset=52
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        br_if 0 (;@2;)
        i32.const 0
        local.set 7
        local.get 6
        local.get 7
        i32.store8 offset=23
        br 1 (;@1;)
      end
      local.get 6
      local.get 2
      i32.store offset=36
      local.get 6
      i32.load offset=36
      local.set 8
      i32.const 1
      local.set 9
      local.get 8
      local.get 9
      i32.sub
      local.set 10
      i32.const 2147483647
      local.set 11
      local.get 11
      local.get 10
      i32.sub
      local.set 12
      i32.const 0
      local.set 13
      local.get 1
      local.set 14
      local.get 13
      local.set 15
      local.get 14
      local.get 15
      i32.eq
      local.set 16
      i32.const 1
      local.set 17
      local.get 16
      local.get 17
      i32.and
      local.set 18
      block  ;; label = @2
        local.get 18
        br_if 0 (;@2;)
        local.get 12
        local.get 1
        i32.div_u
        local.set 19
        local.get 3
        local.set 20
        local.get 19
        local.set 21
        local.get 20
        local.get 21
        i32.gt_u
        local.set 22
        i32.const 1
        local.set 23
        local.get 22
        local.get 23
        i32.and
        local.set 24
        local.get 6
        local.get 24
        i32.store8 offset=23
        br 1 (;@1;)
      end
      i32.const 1048672
      local.set 25
      i32.const 25
      local.set 26
      i32.const 1048656
      local.set 27
      local.get 25
      local.get 26
      local.get 27
      call $_ZN4core9panicking5panic17heed2792a4659ea4dE
      unreachable
    end
    local.get 6
    i32.load8_u offset=23
    local.set 28
    i32.const 1
    local.set 29
    local.get 28
    local.get 29
    i32.and
    local.set 30
    block  ;; label = @1
      block  ;; label = @2
        local.get 30
        br_if 0 (;@2;)
        local.get 1
        local.get 3
        i32.mul
        local.set 31
        local.get 6
        local.get 31
        i32.store offset=56
        local.get 6
        local.get 2
        i32.store offset=40
        local.get 6
        i32.load offset=40
        local.set 32
        local.get 6
        local.get 32
        i32.store offset=60
        local.get 6
        local.get 31
        i32.store offset=28
        local.get 6
        local.get 32
        i32.store offset=24
        local.get 6
        i32.load offset=24
        local.set 33
        local.get 6
        i32.load offset=28
        local.set 34
        local.get 6
        local.get 33
        i32.store offset=8
        local.get 6
        local.get 34
        i32.store offset=12
        br 1 (;@1;)
      end
      i32.const 0
      local.set 35
      local.get 6
      local.get 35
      i32.store offset=8
    end
    local.get 6
    i32.load offset=8
    local.set 36
    local.get 6
    i32.load offset=12
    local.set 37
    local.get 0
    local.get 37
    i32.store offset=4
    local.get 0
    local.get 36
    i32.store
    i32.const 64
    local.set 38
    local.get 6
    local.get 38
    i32.add
    local.set 39
    local.get 39
    global.set $__stack_pointer
    return)
  (func $_ZN4core3str8converts19from_utf8_unchecked17h4c8bd58a28b21fc0E (type 4) (param i32 i32 i32)
    (local i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 16
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    local.get 1
    i32.store offset=8
    local.get 5
    local.get 2
    i32.store offset=12
    local.get 0
    local.get 2
    i32.store offset=4
    local.get 0
    local.get 1
    i32.store
    return)
  (func $_ZN73_$LT$$u5b$A$u5d$$u20$as$u20$core..slice..cmp..SlicePartialEq$LT$B$GT$$GT$5equal17h3ba581bac4c8e761E (type 5) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 4
    i32.const 32
    local.set 5
    local.get 4
    local.get 5
    i32.sub
    local.set 6
    local.get 6
    global.set $__stack_pointer
    local.get 6
    local.get 0
    i32.store offset=8
    local.get 6
    local.get 1
    i32.store offset=12
    local.get 6
    local.get 2
    i32.store offset=16
    local.get 6
    local.get 3
    i32.store offset=20
    local.get 1
    local.set 7
    local.get 3
    local.set 8
    local.get 7
    local.get 8
    i32.ne
    local.set 9
    i32.const 1
    local.set 10
    local.get 9
    local.get 10
    i32.and
    local.set 11
    block  ;; label = @1
      block  ;; label = @2
        local.get 11
        br_if 0 (;@2;)
        i32.const 0
        local.set 12
        local.get 1
        local.get 12
        i32.shl
        local.set 13
        local.get 6
        local.get 13
        i32.store offset=24
        local.get 6
        i32.load offset=24
        local.set 14
        local.get 6
        local.get 14
        i32.store offset=28
        local.get 0
        local.get 2
        local.get 14
        call $memcmp
        local.set 15
        i32.const 0
        local.set 16
        local.get 15
        local.set 17
        local.get 16
        local.set 18
        local.get 17
        local.get 18
        i32.eq
        local.set 19
        i32.const 1
        local.set 20
        local.get 19
        local.get 20
        i32.and
        local.set 21
        local.get 6
        local.get 21
        i32.store8 offset=7
        br 1 (;@1;)
      end
      i32.const 0
      local.set 22
      local.get 6
      local.get 22
      i32.store8 offset=7
    end
    local.get 6
    i32.load8_u offset=7
    local.set 23
    i32.const 1
    local.set 24
    local.get 23
    local.get 24
    i32.and
    local.set 25
    i32.const 32
    local.set 26
    local.get 6
    local.get 26
    i32.add
    local.set 27
    local.get 27
    global.set $__stack_pointer
    local.get 25
    return)
  (func $_ZN42_$LT$$RF$T$u20$as$u20$core..fmt..Debug$GT$3fmt17h303d848590e5ca97E (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 16
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    global.set $__stack_pointer
    local.get 4
    local.get 0
    i32.store offset=8
    local.get 4
    local.get 1
    i32.store offset=12
    local.get 0
    i32.load
    local.set 5
    local.get 0
    i32.load offset=4
    local.set 6
    local.get 5
    local.get 6
    local.get 1
    call $_ZN40_$LT$str$u20$as$u20$core..fmt..Debug$GT$3fmt17h060b461cb37d01e2E
    local.set 7
    i32.const 1
    local.set 8
    local.get 7
    local.get 8
    i32.and
    local.set 9
    i32.const 16
    local.set 10
    local.get 4
    local.get 10
    i32.add
    local.set 11
    local.get 11
    global.set $__stack_pointer
    local.get 9
    return)
  (func $_ZN14string_passing23log_number_saft_wrapper17h9af461f89d0b2ebfE (type 3) (param i32)
    (local i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 16
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store offset=12
    local.get 0
    call $log_number
    i32.const 16
    local.set 4
    local.get 3
    local.get 4
    i32.add
    local.set 5
    local.get 5
    global.set $__stack_pointer
    return)
  (func $alloc_memory (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 96
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    global.set $__stack_pointer
    local.get 4
    local.get 0
    i32.store offset=56
    local.get 4
    local.get 1
    i32.store offset=60
    i32.const 8
    local.set 5
    local.get 4
    local.get 5
    i32.add
    local.set 6
    local.get 6
    local.get 0
    local.get 1
    call $_ZN4core5alloc6layout6Layout15from_size_align17hcfbacc80ae867622E
    local.get 4
    i32.load offset=8
    local.set 7
    local.get 4
    i32.load offset=12
    local.set 8
    local.get 4
    local.get 8
    i32.store offset=20
    local.get 4
    local.get 7
    i32.store offset=16
    local.get 4
    i32.load offset=16
    local.set 9
    i32.const 1
    local.set 10
    i32.const 0
    local.set 11
    local.get 11
    local.get 10
    local.get 9
    select
    local.set 12
    block  ;; label = @1
      local.get 12
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=16
      local.set 13
      local.get 4
      i32.load offset=20
      local.set 14
      local.get 4
      local.get 13
      i32.store offset=64
      local.get 4
      local.get 14
      i32.store offset=68
      local.get 13
      local.get 14
      call $_ZN5alloc5alloc5alloc17hea326feaec09fed8E
      local.set 15
      local.get 4
      local.get 15
      i32.store offset=76
      i32.const 96
      local.set 16
      local.get 4
      local.get 16
      i32.add
      local.set 17
      local.get 17
      global.set $__stack_pointer
      local.get 15
      return
    end
    i32.const 1048740
    local.set 18
    local.get 4
    local.get 18
    i32.store offset=88
    i32.const 1
    local.set 19
    local.get 4
    local.get 19
    i32.store offset=92
    local.get 4
    local.get 18
    i32.store offset=80
    local.get 4
    local.get 19
    i32.store offset=84
    local.get 4
    i32.load offset=80
    local.set 20
    local.get 4
    i32.load offset=84
    local.set 21
    local.get 4
    local.get 20
    i32.store offset=48
    local.get 4
    local.get 21
    i32.store offset=52
    i32.const 24
    local.set 22
    local.get 4
    local.get 22
    i32.add
    local.set 23
    local.get 23
    local.set 24
    i32.const 1048712
    local.set 25
    i32.const 1
    local.set 26
    i32.const 48
    local.set 27
    local.get 4
    local.get 27
    i32.add
    local.set 28
    local.get 28
    local.set 29
    local.get 24
    local.get 25
    local.get 26
    local.get 29
    local.get 26
    call $_ZN4core3fmt9Arguments6new_v117h328b77dec8377bceE
    i32.const 24
    local.set 30
    local.get 4
    local.get 30
    i32.add
    local.set 31
    local.get 31
    local.set 32
    i32.const 1048792
    local.set 33
    local.get 32
    local.get 33
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $dealloc_memory (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 96
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    global.set $__stack_pointer
    local.get 5
    local.get 0
    i32.store offset=60
    local.get 5
    local.get 1
    i32.store offset=64
    local.get 5
    local.get 2
    i32.store offset=68
    i32.const 8
    local.set 6
    local.get 5
    local.get 6
    i32.add
    local.set 7
    local.get 7
    local.get 1
    local.get 2
    call $_ZN4core5alloc6layout6Layout15from_size_align17hcfbacc80ae867622E
    local.get 5
    i32.load offset=8
    local.set 8
    local.get 5
    i32.load offset=12
    local.set 9
    local.get 5
    local.get 9
    i32.store offset=20
    local.get 5
    local.get 8
    i32.store offset=16
    local.get 5
    i32.load offset=16
    local.set 10
    i32.const 1
    local.set 11
    i32.const 0
    local.set 12
    local.get 12
    local.get 11
    local.get 10
    select
    local.set 13
    block  ;; label = @1
      local.get 13
      br_if 0 (;@1;)
      local.get 5
      i32.load offset=16
      local.set 14
      local.get 5
      i32.load offset=20
      local.set 15
      local.get 5
      local.get 14
      i32.store offset=72
      local.get 5
      local.get 15
      i32.store offset=76
      local.get 0
      local.get 14
      local.get 15
      call $_ZN5alloc5alloc7dealloc17hb7a8139b0cc4956cE
      i32.const 96
      local.set 16
      local.get 5
      local.get 16
      i32.add
      local.set 17
      local.get 17
      global.set $__stack_pointer
      return
    end
    i32.const 1048832
    local.set 18
    local.get 5
    local.get 18
    i32.store offset=88
    i32.const 1
    local.set 19
    local.get 5
    local.get 19
    i32.store offset=92
    local.get 5
    local.get 18
    i32.store offset=80
    local.get 5
    local.get 19
    i32.store offset=84
    local.get 5
    i32.load offset=80
    local.set 20
    local.get 5
    i32.load offset=84
    local.set 21
    local.get 5
    local.get 20
    i32.store offset=48
    local.get 5
    local.get 21
    i32.store offset=52
    i32.const 24
    local.set 22
    local.get 5
    local.get 22
    i32.add
    local.set 23
    local.get 23
    local.set 24
    i32.const 1048712
    local.set 25
    i32.const 1
    local.set 26
    i32.const 48
    local.set 27
    local.get 5
    local.get 27
    i32.add
    local.set 28
    local.get 28
    local.set 29
    local.get 24
    local.get 25
    local.get 26
    local.get 29
    local.get 26
    call $_ZN4core3fmt9Arguments6new_v117h328b77dec8377bceE
    i32.const 24
    local.set 30
    local.get 5
    local.get 30
    i32.add
    local.set 31
    local.get 31
    local.set 32
    i32.const 1048840
    local.set 33
    local.get 32
    local.get 33
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN14string_passing30function_take_string_reference17h7fa2d65080102586E (type 7) (param i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 16
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    global.set $__stack_pointer
    i32.const 8
    local.set 4
    local.get 3
    local.get 4
    i32.add
    local.set 5
    local.get 5
    local.get 0
    call $_ZN5alloc6string6String6as_str17h91520fda16fb8986E
    local.get 3
    i32.load offset=12
    local.set 6
    local.get 3
    i32.load offset=8
    local.set 7
    i32.const 1048864
    local.set 8
    i32.const 20
    local.set 9
    local.get 7
    local.get 6
    local.get 8
    local.get 9
    call $_ZN4core3str6traits54_$LT$impl$u20$core..cmp..PartialEq$u20$for$u20$str$GT$2eq17h920cbdd34467a2f7E
    local.set 10
    i32.const 1
    local.set 11
    local.get 10
    local.get 11
    i32.and
    local.set 12
    block  ;; label = @1
      block  ;; label = @2
        local.get 12
        br_if 0 (;@2;)
        i32.const 10000
        local.set 13
        local.get 13
        call $_ZN14string_passing23log_number_saft_wrapper17h9af461f89d0b2ebfE
        br 1 (;@1;)
      end
      i32.const 100
      local.set 14
      local.get 14
      call $_ZN14string_passing23log_number_saft_wrapper17h9af461f89d0b2ebfE
    end
    local.get 0
    call $_ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$17hb0cd76a9651b039eE
    i32.const 1
    local.set 15
    i32.const 16
    local.set 16
    local.get 3
    local.get 16
    i32.add
    local.set 17
    local.get 17
    global.set $__stack_pointer
    local.get 15
    return)
  (func $function_call_js_with_string (type 8)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 0
    i32.const 16
    local.set 1
    local.get 0
    local.get 1
    i32.sub
    local.set 2
    local.get 2
    global.set $__stack_pointer
    i32.const 1048884
    local.set 3
    local.get 2
    local.get 3
    i32.store
    i32.const 21
    local.set 4
    local.get 2
    local.get 4
    i32.store offset=4
    i32.const 1048884
    local.set 5
    local.get 2
    local.get 5
    i32.store offset=8
    i32.const 21
    local.set 6
    local.get 2
    local.get 6
    i32.store offset=12
    i32.const 1048884
    local.set 7
    i32.const 21
    local.set 8
    local.get 7
    local.get 8
    call $_ZN4core3str21_$LT$impl$u20$str$GT$3len17ha1074d3a3c73594cE
    local.set 9
    i32.const 1048884
    local.set 10
    local.get 10
    local.get 9
    call $js_function
    i32.const 16
    local.set 11
    local.get 2
    local.get 11
    i32.add
    local.set 12
    local.get 12
    global.set $__stack_pointer
    return)
  (func $function_take_string_reference (type 0) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 64
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    global.set $__stack_pointer
    local.get 4
    local.get 0
    i32.store offset=40
    local.get 4
    local.get 1
    i32.store offset=44
    i32.const 8
    local.set 5
    local.get 4
    local.get 5
    i32.add
    local.set 6
    local.get 6
    local.get 0
    local.get 1
    call $_ZN4core5slice3raw14from_raw_parts17h69c280e81ddab2e3E
    local.get 4
    i32.load offset=12
    local.set 7
    local.get 4
    i32.load offset=8
    local.set 8
    local.get 4
    local.get 8
    i32.store offset=48
    local.get 4
    local.get 7
    i32.store offset=52
    i32.const 16
    local.set 9
    local.get 4
    local.get 9
    i32.add
    local.set 10
    local.get 10
    local.get 8
    local.get 7
    call $_ZN4core3str8converts19from_utf8_unchecked17h4c8bd58a28b21fc0E
    local.get 4
    i32.load offset=20
    local.set 11
    local.get 4
    i32.load offset=16
    local.set 12
    local.get 4
    local.get 12
    i32.store offset=56
    local.get 4
    local.get 11
    i32.store offset=60
    i32.const 24
    local.set 13
    local.get 4
    local.get 13
    i32.add
    local.set 14
    local.get 14
    local.set 15
    local.get 15
    local.get 12
    local.get 11
    call $_ZN76_$LT$alloc..string..String$u20$as$u20$core..convert..From$LT$$RF$str$GT$$GT$4from17hc94bf98bf1a22002E
    i32.const 24
    local.set 16
    local.get 4
    local.get 16
    i32.add
    local.set 17
    local.get 17
    local.set 18
    local.get 18
    call $_ZN14string_passing30function_take_string_reference17h7fa2d65080102586E
    drop
    i32.const 64
    local.set 19
    local.get 4
    local.get 19
    i32.add
    local.set 20
    local.get 20
    global.set $__stack_pointer
    return)
  (func $_ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$17hb0cd76a9651b039eE (type 3) (param i32)
    (local i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 16
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store offset=12
    local.get 0
    call $_ZN4core3ptr46drop_in_place$LT$alloc..vec..Vec$LT$u8$GT$$GT$17hd3138384eafd5a4fE
    i32.const 16
    local.set 4
    local.get 3
    local.get 4
    i32.add
    local.set 5
    local.get 5
    global.set $__stack_pointer
    return)
  (func $_ZN4core3ptr46drop_in_place$LT$alloc..vec..Vec$LT$u8$GT$$GT$17hd3138384eafd5a4fE (type 3) (param i32)
    (local i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 16
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store offset=12
    local.get 0
    call $_ZN70_$LT$alloc..vec..Vec$LT$T$C$A$GT$$u20$as$u20$core..ops..drop..Drop$GT$4drop17h724d0a6d41e5ac8fE
    local.get 0
    call $_ZN4core3ptr53drop_in_place$LT$alloc..raw_vec..RawVec$LT$u8$GT$$GT$17h1e31c940e20aa58aE
    i32.const 16
    local.set 4
    local.get 3
    local.get 4
    i32.add
    local.set 5
    local.get 5
    global.set $__stack_pointer
    return)
  (func $_ZN70_$LT$alloc..vec..Vec$LT$T$C$A$GT$$u20$as$u20$core..ops..drop..Drop$GT$4drop17h724d0a6d41e5ac8fE (type 3) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 48
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    local.get 0
    i32.store offset=16
    local.get 3
    i32.load offset=16
    local.set 4
    local.get 3
    local.get 4
    i32.store offset=20
    local.get 0
    i32.load
    local.set 5
    local.get 3
    local.get 5
    i32.store offset=32
    local.get 3
    local.get 5
    i32.store offset=36
    local.get 0
    i32.load offset=8
    local.set 6
    local.get 3
    local.get 6
    i32.store offset=40
    local.get 3
    local.get 5
    i32.store offset=44
    local.get 3
    local.get 5
    i32.store offset=8
    local.get 3
    local.get 6
    i32.store offset=12
    local.get 3
    i32.load offset=8
    local.set 7
    local.get 3
    i32.load offset=12
    local.set 8
    local.get 3
    local.get 7
    i32.store
    local.get 3
    local.get 8
    i32.store offset=4
    return)
  (func $_ZN4core3ptr53drop_in_place$LT$alloc..raw_vec..RawVec$LT$u8$GT$$GT$17h1e31c940e20aa58aE (type 3) (param i32)
    (local i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 16
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store offset=12
    local.get 0
    call $_ZN77_$LT$alloc..raw_vec..RawVec$LT$T$C$A$GT$$u20$as$u20$core..ops..drop..Drop$GT$4drop17hd643e8292af3f98aE
    i32.const 16
    local.set 4
    local.get 3
    local.get 4
    i32.add
    local.set 5
    local.get 5
    global.set $__stack_pointer
    return)
  (func $_ZN77_$LT$alloc..raw_vec..RawVec$LT$T$C$A$GT$$u20$as$u20$core..ops..drop..Drop$GT$4drop17hd643e8292af3f98aE (type 3) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 1
    i32.const 32
    local.set 2
    local.get 1
    local.get 2
    i32.sub
    local.set 3
    local.get 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store offset=16
    local.get 3
    local.set 4
    local.get 4
    local.get 0
    call $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$14current_memory17h62f8a4c2dd663524E
    local.get 3
    i32.load offset=4
    local.set 5
    i32.const 0
    local.set 6
    i32.const 1
    local.set 7
    local.get 7
    local.get 6
    local.get 5
    select
    local.set 8
    i32.const 1
    local.set 9
    local.get 8
    local.set 10
    local.get 9
    local.set 11
    local.get 10
    local.get 11
    i32.eq
    local.set 12
    i32.const 1
    local.set 13
    local.get 12
    local.get 13
    i32.and
    local.set 14
    block  ;; label = @1
      local.get 14
      i32.eqz
      br_if 0 (;@1;)
      local.get 3
      i32.load
      local.set 15
      local.get 3
      local.get 15
      i32.store offset=20
      local.get 3
      i32.load offset=4
      local.set 16
      local.get 3
      i32.load offset=8
      local.set 17
      local.get 3
      local.get 16
      i32.store offset=24
      local.get 3
      local.get 17
      i32.store offset=28
      local.get 0
      local.get 15
      local.get 16
      local.get 17
      call $_ZN63_$LT$alloc..alloc..Global$u20$as$u20$core..alloc..Allocator$GT$10deallocate17h713636486edcc00aE
    end
    i32.const 32
    local.set 18
    local.get 3
    local.get 18
    i32.add
    local.set 19
    local.get 19
    global.set $__stack_pointer
    return)
  (func $_ZN4core3fmt9Arguments6new_v117h328b77dec8377bceE (type 9) (param i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 5
    i32.const 80
    local.set 6
    local.get 5
    local.get 6
    i32.sub
    local.set 7
    local.get 7
    global.set $__stack_pointer
    local.get 7
    local.get 1
    i32.store offset=56
    local.get 7
    local.get 2
    i32.store offset=60
    local.get 7
    local.get 3
    i32.store offset=64
    local.get 7
    local.get 4
    i32.store offset=68
    local.get 2
    local.set 8
    local.get 4
    local.set 9
    local.get 8
    local.get 9
    i32.lt_u
    local.set 10
    i32.const 1
    local.set 11
    local.get 10
    local.get 11
    i32.and
    local.set 12
    block  ;; label = @1
      block  ;; label = @2
        local.get 12
        br_if 0 (;@2;)
        i32.const 1
        local.set 13
        local.get 4
        local.get 13
        i32.add
        local.set 14
        local.get 2
        local.set 15
        local.get 14
        local.set 16
        local.get 15
        local.get 16
        i32.gt_u
        local.set 17
        i32.const 1
        local.set 18
        local.get 17
        local.get 18
        i32.and
        local.set 19
        local.get 7
        local.get 19
        i32.store8 offset=15
        br 1 (;@1;)
      end
      i32.const 1
      local.set 20
      local.get 7
      local.get 20
      i32.store8 offset=15
    end
    local.get 7
    i32.load8_u offset=15
    local.set 21
    i32.const 1
    local.set 22
    local.get 21
    local.get 22
    i32.and
    local.set 23
    block  ;; label = @1
      local.get 23
      br_if 0 (;@1;)
      i32.const 0
      local.set 24
      local.get 7
      local.get 24
      i32.store offset=40
      local.get 0
      local.get 1
      i32.store
      local.get 0
      local.get 2
      i32.store offset=4
      local.get 7
      i32.load offset=40
      local.set 25
      local.get 7
      i32.load offset=44
      local.set 26
      local.get 0
      local.get 25
      i32.store offset=16
      local.get 0
      local.get 26
      i32.store offset=20
      local.get 0
      local.get 3
      i32.store offset=8
      local.get 0
      local.get 4
      i32.store offset=12
      i32.const 80
      local.set 27
      local.get 7
      local.get 27
      i32.add
      local.set 28
      local.get 28
      global.set $__stack_pointer
      return
    end
    i32.const 1048920
    local.set 29
    local.get 7
    local.get 29
    i32.store offset=72
    i32.const 1
    local.set 30
    local.get 7
    local.get 30
    i32.store offset=76
    i32.const 0
    local.set 31
    local.get 7
    local.get 31
    i32.store offset=48
    i32.const 1048920
    local.set 32
    local.get 7
    local.get 32
    i32.store offset=16
    i32.const 1
    local.set 33
    local.get 7
    local.get 33
    i32.store offset=20
    local.get 7
    i32.load offset=48
    local.set 34
    local.get 7
    i32.load offset=52
    local.set 35
    local.get 7
    local.get 34
    i32.store offset=32
    local.get 7
    local.get 35
    i32.store offset=36
    i32.const 1048928
    local.set 36
    local.get 7
    local.get 36
    i32.store offset=24
    i32.const 0
    local.set 37
    local.get 7
    local.get 37
    i32.store offset=28
    i32.const 16
    local.set 38
    local.get 7
    local.get 38
    i32.add
    local.set 39
    local.get 39
    local.set 40
    i32.const 1049004
    local.set 41
    local.get 40
    local.get 41
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN5alloc5alloc5alloc17hea326feaec09fed8E (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 2
    i32.const 32
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    global.set $__stack_pointer
    i32.const 1052753
    local.set 5
    local.get 4
    local.get 5
    i32.store
    local.get 4
    local.get 0
    i32.store offset=8
    local.get 4
    local.get 1
    i32.store offset=12
    i32.const 8
    local.set 6
    local.get 4
    local.get 6
    i32.add
    local.set 7
    local.get 7
    local.set 8
    local.get 4
    local.get 8
    i32.store offset=16
    i32.const 8
    local.set 9
    local.get 4
    local.get 9
    i32.add
    local.set 10
    local.get 10
    local.set 11
    local.get 4
    local.get 11
    i32.store offset=20
    i32.const 0
    local.set 12
    local.get 12
    i32.load8_u offset=1052753
    local.set 13
    local.get 4
    local.get 13
    i32.store8 offset=27
    local.get 4
    local.get 0
    i32.store offset=28
    local.get 4
    local.get 0
    i32.store offset=4
    local.get 4
    i32.load offset=4
    local.set 14
    local.get 1
    local.get 14
    call $__rust_alloc
    local.set 15
    i32.const 32
    local.set 16
    local.get 4
    local.get 16
    i32.add
    local.set 17
    local.get 17
    global.set $__stack_pointer
    local.get 15
    return)
  (func $_ZN5alloc5alloc6Global10alloc_impl17hdb32f2949292a3a1E (type 9) (param i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 5
    i32.const 320
    local.set 6
    local.get 5
    local.get 6
    i32.sub
    local.set 7
    local.get 7
    global.set $__stack_pointer
    i32.const 0
    local.set 8
    local.get 7
    local.get 8
    i32.store offset=8
    i32.const 0
    local.set 9
    local.get 7
    local.get 9
    i32.store offset=12
    i32.const 0
    local.set 10
    local.get 7
    local.get 10
    i32.store offset=16
    i32.const 1052753
    local.set 11
    local.get 7
    local.get 11
    i32.store offset=20
    local.get 7
    local.get 1
    i32.store offset=172
    local.get 7
    local.get 2
    i32.store offset=176
    local.get 7
    local.get 3
    i32.store offset=180
    i32.const 176
    local.set 12
    local.get 7
    local.get 12
    i32.add
    local.set 13
    local.get 13
    local.set 14
    local.get 7
    local.get 14
    i32.store offset=184
    i32.const 176
    local.set 15
    local.get 7
    local.get 15
    i32.add
    local.set 16
    local.get 16
    local.set 17
    local.get 7
    local.get 17
    i32.store offset=188
    i32.const 176
    local.set 18
    local.get 7
    local.get 18
    i32.add
    local.set 19
    local.get 19
    local.set 20
    local.get 7
    local.get 20
    i32.store offset=192
    local.get 4
    local.set 21
    local.get 7
    local.get 21
    i32.store8 offset=199
    local.get 7
    local.get 3
    i32.store offset=200
    block  ;; label = @1
      block  ;; label = @2
        local.get 3
        br_if 0 (;@2;)
        local.get 7
        local.get 2
        i32.store offset=204
        local.get 7
        local.get 2
        i32.store offset=116
        local.get 7
        i32.load offset=116
        local.set 22
        local.get 7
        local.get 22
        i32.store offset=208
        local.get 7
        local.get 22
        i32.store offset=212
        local.get 7
        local.get 22
        i32.store offset=84
        local.get 7
        i32.load offset=84
        local.set 23
        local.get 7
        local.get 23
        i32.store offset=216
        local.get 7
        local.get 23
        i32.store offset=220
        local.get 7
        local.get 23
        i32.store offset=128
        i32.const 0
        local.set 24
        local.get 7
        local.get 24
        i32.store offset=132
        local.get 7
        i32.load offset=128
        local.set 25
        local.get 7
        i32.load offset=132
        local.set 26
        local.get 7
        local.get 25
        i32.store offset=120
        local.get 7
        local.get 26
        i32.store offset=124
        local.get 7
        i32.load offset=120
        local.set 27
        local.get 7
        i32.load offset=124
        local.set 28
        local.get 7
        local.get 27
        i32.store offset=224
        local.get 7
        local.get 28
        i32.store offset=228
        local.get 7
        local.get 27
        i32.store offset=72
        local.get 7
        local.get 28
        i32.store offset=76
        local.get 7
        i32.load offset=72
        local.set 29
        local.get 7
        i32.load offset=76
        local.set 30
        local.get 7
        local.get 29
        i32.store offset=64
        local.get 7
        local.get 30
        i32.store offset=68
        br 1 (;@1;)
      end
      local.get 4
      local.set 31
      block  ;; label = @2
        block  ;; label = @3
          local.get 31
          br_if 0 (;@3;)
          local.get 7
          local.get 3
          i32.store offset=236
          i32.const 236
          local.set 32
          local.get 7
          local.get 32
          i32.add
          local.set 33
          local.get 33
          local.set 34
          local.get 7
          local.get 34
          i32.store offset=240
          i32.const 236
          local.set 35
          local.get 7
          local.get 35
          i32.add
          local.set 36
          local.get 36
          local.set 37
          local.get 7
          local.get 37
          i32.store offset=244
          local.get 7
          local.get 2
          i32.store offset=248
          i32.const 248
          local.set 38
          local.get 7
          local.get 38
          i32.add
          local.set 39
          local.get 39
          local.set 40
          local.get 7
          local.get 40
          i32.store offset=252
          i32.const 248
          local.set 41
          local.get 7
          local.get 41
          i32.add
          local.set 42
          local.get 42
          local.set 43
          local.get 7
          local.get 43
          i32.store offset=256
          i32.const 0
          local.set 44
          local.get 44
          i32.load8_u offset=1052753
          local.set 45
          local.get 7
          local.get 45
          i32.store8 offset=263
          local.get 7
          local.get 2
          i32.store offset=144
          local.get 7
          i32.load offset=144
          local.set 46
          local.get 3
          local.get 46
          call $__rust_alloc
          local.set 47
          local.get 7
          local.get 47
          i32.store offset=88
          br 1 (;@2;)
        end
        local.get 7
        local.get 3
        i32.store offset=264
        i32.const 264
        local.set 48
        local.get 7
        local.get 48
        i32.add
        local.set 49
        local.get 49
        local.set 50
        local.get 7
        local.get 50
        i32.store offset=268
        i32.const 264
        local.set 51
        local.get 7
        local.get 51
        i32.add
        local.set 52
        local.get 52
        local.set 53
        local.get 7
        local.get 53
        i32.store offset=272
        local.get 7
        local.get 2
        i32.store offset=276
        i32.const 276
        local.set 54
        local.get 7
        local.get 54
        i32.add
        local.set 55
        local.get 55
        local.set 56
        local.get 7
        local.get 56
        i32.store offset=280
        i32.const 276
        local.set 57
        local.get 7
        local.get 57
        i32.add
        local.set 58
        local.get 58
        local.set 59
        local.get 7
        local.get 59
        i32.store offset=284
        local.get 7
        local.get 2
        i32.store offset=140
        local.get 7
        i32.load offset=140
        local.set 60
        local.get 3
        local.get 60
        call $__rust_alloc_zeroed
        local.set 61
        local.get 7
        local.get 61
        i32.store offset=88
      end
      local.get 7
      i32.load offset=88
      local.set 62
      local.get 7
      local.get 62
      i32.store offset=288
      i32.const 0
      local.set 63
      local.get 62
      local.set 64
      local.get 63
      local.set 65
      local.get 64
      local.get 65
      i32.eq
      local.set 66
      i32.const -1
      local.set 67
      local.get 66
      local.get 67
      i32.xor
      local.set 68
      i32.const 1
      local.set 69
      local.get 68
      local.get 69
      i32.and
      local.set 70
      block  ;; label = @2
        block  ;; label = @3
          local.get 70
          br_if 0 (;@3;)
          i32.const 0
          local.set 71
          local.get 7
          local.get 71
          i32.store offset=100
          br 1 (;@2;)
        end
        local.get 7
        local.get 62
        i32.store offset=148
        local.get 7
        i32.load offset=148
        local.set 72
        local.get 7
        local.get 72
        i32.store offset=100
      end
      local.get 7
      i32.load offset=100
      local.set 73
      i32.const 0
      local.set 74
      i32.const 1
      local.set 75
      local.get 75
      local.get 74
      local.get 73
      select
      local.set 76
      block  ;; label = @2
        block  ;; label = @3
          local.get 76
          br_if 0 (;@3;)
          i32.const 0
          local.set 77
          local.get 7
          local.get 77
          i32.store offset=96
          br 1 (;@2;)
        end
        local.get 7
        i32.load offset=100
        local.set 78
        local.get 7
        local.get 78
        i32.store offset=292
        local.get 7
        local.get 78
        i32.store offset=96
      end
      local.get 7
      i32.load offset=96
      local.set 79
      i32.const 1
      local.set 80
      i32.const 0
      local.set 81
      local.get 81
      local.get 80
      local.get 79
      select
      local.set 82
      block  ;; label = @2
        block  ;; label = @3
          local.get 82
          br_if 0 (;@3;)
          local.get 7
          i32.load offset=96
          local.set 83
          local.get 7
          local.get 83
          i32.store offset=296
          local.get 7
          local.get 83
          i32.store offset=92
          br 1 (;@2;)
        end
        i32.const 0
        local.set 84
        local.get 7
        local.get 84
        i32.store offset=92
      end
      local.get 7
      i32.load offset=92
      local.set 85
      i32.const 1
      local.set 86
      i32.const 0
      local.set 87
      local.get 87
      local.get 86
      local.get 85
      select
      local.set 88
      block  ;; label = @2
        local.get 88
        br_if 0 (;@2;)
        local.get 7
        i32.load offset=92
        local.set 89
        local.get 7
        local.get 89
        i32.store offset=300
        local.get 7
        local.get 89
        i32.store offset=304
        local.get 7
        local.get 89
        i32.store offset=308
        local.get 7
        local.get 89
        i32.store offset=160
        local.get 7
        local.get 3
        i32.store offset=164
        local.get 7
        i32.load offset=160
        local.set 90
        local.get 7
        i32.load offset=164
        local.set 91
        local.get 7
        local.get 90
        i32.store offset=152
        local.get 7
        local.get 91
        i32.store offset=156
        local.get 7
        i32.load offset=152
        local.set 92
        local.get 7
        i32.load offset=156
        local.set 93
        local.get 7
        local.get 92
        i32.store offset=312
        local.get 7
        local.get 93
        i32.store offset=316
        local.get 7
        local.get 92
        i32.store offset=104
        local.get 7
        local.get 93
        i32.store offset=108
        local.get 7
        i32.load offset=104
        local.set 94
        local.get 7
        i32.load offset=108
        local.set 95
        local.get 7
        local.get 94
        i32.store offset=64
        local.get 7
        local.get 95
        i32.store offset=68
        br 1 (;@1;)
      end
      i32.const 0
      local.set 96
      local.get 7
      local.get 96
      i32.store offset=64
    end
    local.get 7
    i32.load offset=64
    local.set 97
    local.get 7
    i32.load offset=68
    local.set 98
    local.get 0
    local.get 98
    i32.store offset=4
    local.get 0
    local.get 97
    i32.store
    i32.const 320
    local.set 99
    local.get 7
    local.get 99
    i32.add
    local.set 100
    local.get 100
    global.set $__stack_pointer
    return)
  (func $_ZN5alloc5alloc7dealloc17hb7a8139b0cc4956cE (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 3
    i32.const 32
    local.set 4
    local.get 3
    local.get 4
    i32.sub
    local.set 5
    local.get 5
    global.set $__stack_pointer
    local.get 5
    local.get 0
    i32.store offset=4
    local.get 5
    local.get 1
    i32.store offset=8
    local.get 5
    local.get 2
    i32.store offset=12
    i32.const 8
    local.set 6
    local.get 5
    local.get 6
    i32.add
    local.set 7
    local.get 7
    local.set 8
    local.get 5
    local.get 8
    i32.store offset=20
    i32.const 8
    local.set 9
    local.get 5
    local.get 9
    i32.add
    local.set 10
    local.get 10
    local.set 11
    local.get 5
    local.get 11
    i32.store offset=24
    local.get 5
    local.get 1
    i32.store offset=28
    local.get 5
    local.get 1
    i32.store
    local.get 5
    i32.load
    local.set 12
    local.get 0
    local.get 2
    local.get 12
    call $__rust_dealloc
    i32.const 32
    local.set 13
    local.get 5
    local.get 13
    i32.add
    local.set 14
    local.get 14
    global.set $__stack_pointer
    return)
  (func $_ZN63_$LT$alloc..alloc..Global$u20$as$u20$core..alloc..Allocator$GT$10deallocate17h713636486edcc00aE (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 4
    i32.const 64
    local.set 5
    local.get 4
    local.get 5
    i32.sub
    local.set 6
    local.get 6
    global.set $__stack_pointer
    local.get 6
    local.get 0
    i32.store offset=16
    local.get 6
    local.get 1
    i32.store offset=20
    local.get 6
    local.get 2
    i32.store offset=24
    local.get 6
    local.get 3
    i32.store offset=28
    i32.const 24
    local.set 7
    local.get 6
    local.get 7
    i32.add
    local.set 8
    local.get 8
    local.set 9
    local.get 6
    local.get 9
    i32.store offset=32
    block  ;; label = @1
      block  ;; label = @2
        local.get 3
        br_if 0 (;@2;)
        br 1 (;@1;)
      end
      local.get 6
      local.get 1
      i32.store offset=36
      local.get 6
      local.get 3
      i32.store offset=40
      i32.const 40
      local.set 10
      local.get 6
      local.get 10
      i32.add
      local.set 11
      local.get 11
      local.set 12
      local.get 6
      local.get 12
      i32.store offset=44
      i32.const 40
      local.set 13
      local.get 6
      local.get 13
      i32.add
      local.set 14
      local.get 14
      local.set 15
      local.get 6
      local.get 15
      i32.store offset=48
      local.get 6
      local.get 2
      i32.store offset=52
      i32.const 52
      local.set 16
      local.get 6
      local.get 16
      i32.add
      local.set 17
      local.get 17
      local.set 18
      local.get 6
      local.get 18
      i32.store offset=56
      i32.const 52
      local.set 19
      local.get 6
      local.get 19
      i32.add
      local.set 20
      local.get 20
      local.set 21
      local.get 6
      local.get 21
      i32.store offset=60
      local.get 6
      local.get 2
      i32.store offset=12
      local.get 6
      i32.load offset=12
      local.set 22
      local.get 1
      local.get 3
      local.get 22
      call $__rust_dealloc
    end
    i32.const 64
    local.set 23
    local.get 6
    local.get 23
    i32.add
    local.set 24
    local.get 24
    global.set $__stack_pointer
    return)
  (func $_ZN63_$LT$alloc..alloc..Global$u20$as$u20$core..alloc..Allocator$GT$15allocate_zeroed17hc930a39b4481a697E (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 4
    i32.const 32
    local.set 5
    local.get 4
    local.get 5
    i32.sub
    local.set 6
    local.get 6
    global.set $__stack_pointer
    local.get 6
    local.get 1
    i32.store offset=20
    local.get 6
    local.get 2
    i32.store offset=24
    local.get 6
    local.get 3
    i32.store offset=28
    i32.const 1
    local.set 7
    i32.const 8
    local.set 8
    local.get 6
    local.get 8
    i32.add
    local.set 9
    local.get 9
    local.get 1
    local.get 2
    local.get 3
    local.get 7
    call $_ZN5alloc5alloc6Global10alloc_impl17hdb32f2949292a3a1E
    local.get 6
    i32.load offset=8
    local.set 10
    local.get 6
    i32.load offset=12
    local.set 11
    local.get 0
    local.get 11
    i32.store offset=4
    local.get 0
    local.get 10
    i32.store
    i32.const 32
    local.set 12
    local.get 6
    local.get 12
    i32.add
    local.set 13
    local.get 13
    global.set $__stack_pointer
    return)
  (func $_ZN63_$LT$alloc..alloc..Global$u20$as$u20$core..alloc..Allocator$GT$8allocate17h3a5ac31c568f2c4fE (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    local.set 4
    i32.const 32
    local.set 5
    local.get 4
    local.get 5
    i32.sub
    local.set 6
    local.get 6
    global.set $__stack_pointer
    local.get 6
    local.get 1
    i32.store offset=20
    local.get 6
    local.get 2
    i32.store offset=24
    local.get 6
    local.get 3
    i32.store offset=28
    i32.const 0
    local.set 7
    i32.const 8
    local.set 8
    local.get 6
    local.get 8
    i32.add
    local.set 9
    local.get 9
    local.get 1
    local.get 2
    local.get 3
    local.get 7
    call $_ZN5alloc5alloc6Global10alloc_impl17hdb32f2949292a3a1E
    local.get 6
    i32.load offset=8
    local.set 10
    local.get 6
    i32.load offset=12
    local.set 11
    local.get 0
    local.get 11
    i32.store offset=4
    local.get 0
    local.get 10
    i32.store
    i32.const 32
    local.set 12
    local.get 6
    local.get 12
    i32.add
    local.set 13
    local.get 13
    global.set $__stack_pointer
    return)
  (func $__rust_alloc (type 2) (param i32 i32) (result i32)
    (local i32)
    local.get 0
    local.get 1
    call $__rdl_alloc
    local.set 2
    local.get 2
    return)
  (func $__rust_dealloc (type 4) (param i32 i32 i32)
    local.get 0
    local.get 1
    local.get 2
    call $__rdl_dealloc
    return)
  (func $__rust_realloc (type 5) (param i32 i32 i32 i32) (result i32)
    (local i32)
    local.get 0
    local.get 1
    local.get 2
    local.get 3
    call $__rdl_realloc
    local.set 4
    local.get 4
    return)
  (func $__rust_alloc_zeroed (type 2) (param i32 i32) (result i32)
    (local i32)
    local.get 0
    local.get 1
    call $__rdl_alloc_zeroed
    local.set 2
    local.get 2
    return)
  (func $__rust_alloc_error_handler (type 0) (param i32 i32)
    local.get 0
    local.get 1
    call $__rg_oom
    return)
  (func $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17h0e919b83d9294a5fE (type 0) (param i32 i32)
    local.get 0
    i64.const 7714510750261652668
    i64.store offset=8
    local.get 0
    i64.const 3892613385407120629
    i64.store)
  (func $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17h3f0023a0be2ed8e7E (type 0) (param i32 i32)
    local.get 0
    i64.const -163230743173927068
    i64.store offset=8
    local.get 0
    i64.const -4493808902380553279
    i64.store)
  (func $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17h48836f8f70f802fdE (type 0) (param i32 i32)
    local.get 0
    i64.const -2172292916962619663
    i64.store offset=8
    local.get 0
    i64.const 5849247493078730862
    i64.store)
  (func $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$7reserve21do_reserve_and_handle17hcc5562826e1d69f5E (type 4) (param i32 i32 i32)
    (local i32 i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        local.get 2
        i32.add
        local.tee 2
        local.get 1
        i32.lt_u
        br_if 0 (;@2;)
        local.get 0
        i32.const 4
        i32.add
        i32.load
        local.tee 1
        i32.const 1
        i32.shl
        local.tee 4
        local.get 2
        local.get 4
        local.get 2
        i32.gt_u
        select
        local.tee 2
        i32.const 8
        local.get 2
        i32.const 8
        i32.gt_u
        select
        local.tee 2
        i32.const -1
        i32.xor
        i32.const 31
        i32.shr_u
        local.set 4
        block  ;; label = @3
          block  ;; label = @4
            local.get 1
            i32.eqz
            br_if 0 (;@4;)
            local.get 3
            local.get 1
            i32.store offset=24
            local.get 3
            i32.const 1
            i32.store offset=20
            local.get 3
            local.get 0
            i32.load
            i32.store offset=16
            br 1 (;@3;)
          end
          local.get 3
          i32.const 0
          i32.store offset=20
        end
        local.get 3
        local.get 4
        local.get 2
        local.get 3
        i32.const 16
        i32.add
        call $_ZN5alloc7raw_vec11finish_grow17h77ad956293c183dfE
        local.get 3
        i32.load offset=4
        local.set 1
        block  ;; label = @3
          local.get 3
          i32.load
          br_if 0 (;@3;)
          local.get 0
          local.get 1
          i32.store
          local.get 0
          i32.const 4
          i32.add
          local.get 2
          i32.store
          br 2 (;@1;)
        end
        local.get 1
        i32.const -2147483647
        i32.eq
        br_if 1 (;@1;)
        local.get 1
        i32.eqz
        br_if 0 (;@2;)
        local.get 1
        local.get 3
        i32.const 8
        i32.add
        i32.load
        call $_ZN5alloc5alloc18handle_alloc_error17hda4b1b4e18f53a00E
        unreachable
      end
      call $_ZN5alloc7raw_vec17capacity_overflow17h9db66c34eec3373bE
      unreachable
    end
    local.get 3
    i32.const 32
    i32.add
    global.set $__stack_pointer)
  (func $_ZN4core3ptr100drop_in_place$LT$$RF$mut$u20$std..io..Write..write_fmt..Adapter$LT$alloc..vec..Vec$LT$u8$GT$$GT$$GT$17h79c6a2d095fff53dE (type 3) (param i32))
  (func $_ZN4core3ptr29drop_in_place$LT$$LP$$RP$$GT$17h1541364658a4c3e0E (type 3) (param i32))
  (func $_ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$17hd1fd0dab68cf6b27E (type 3) (param i32)
    (local i32)
    block  ;; label = @1
      local.get 0
      i32.const 4
      i32.add
      i32.load
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load
      local.get 1
      i32.const 1
      call $__rust_dealloc
    end)
  (func $_ZN4core3ptr70drop_in_place$LT$std..panicking..begin_panic_handler..PanicPayload$GT$17hb278bce6ff851616E (type 3) (param i32)
    (local i32)
    block  ;; label = @1
      local.get 0
      i32.load offset=4
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const 8
      i32.add
      i32.load
      local.tee 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.const 1
      call $__rust_dealloc
    end)
  (func $_ZN50_$LT$$RF$mut$u20$W$u20$as$u20$core..fmt..Write$GT$10write_char17hc19cd3a62fd9b3a5E (type 2) (param i32 i32) (result i32)
    (local i32 i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    local.get 0
    i32.load
    local.set 0
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 1
            i32.const 128
            i32.lt_u
            br_if 0 (;@4;)
            local.get 2
            i32.const 0
            i32.store offset=12
            local.get 1
            i32.const 2048
            i32.lt_u
            br_if 1 (;@3;)
            block  ;; label = @5
              local.get 1
              i32.const 65536
              i32.ge_u
              br_if 0 (;@5;)
              local.get 2
              local.get 1
              i32.const 63
              i32.and
              i32.const 128
              i32.or
              i32.store8 offset=14
              local.get 2
              local.get 1
              i32.const 12
              i32.shr_u
              i32.const 224
              i32.or
              i32.store8 offset=12
              local.get 2
              local.get 1
              i32.const 6
              i32.shr_u
              i32.const 63
              i32.and
              i32.const 128
              i32.or
              i32.store8 offset=13
              i32.const 3
              local.set 1
              br 3 (;@2;)
            end
            local.get 2
            local.get 1
            i32.const 63
            i32.and
            i32.const 128
            i32.or
            i32.store8 offset=15
            local.get 2
            local.get 1
            i32.const 6
            i32.shr_u
            i32.const 63
            i32.and
            i32.const 128
            i32.or
            i32.store8 offset=14
            local.get 2
            local.get 1
            i32.const 12
            i32.shr_u
            i32.const 63
            i32.and
            i32.const 128
            i32.or
            i32.store8 offset=13
            local.get 2
            local.get 1
            i32.const 18
            i32.shr_u
            i32.const 7
            i32.and
            i32.const 240
            i32.or
            i32.store8 offset=12
            i32.const 4
            local.set 1
            br 2 (;@2;)
          end
          block  ;; label = @4
            local.get 0
            i32.load offset=8
            local.tee 3
            local.get 0
            i32.load offset=4
            i32.ne
            br_if 0 (;@4;)
            local.get 0
            local.get 3
            call $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$16reserve_for_push17h87349f4e2038b656E
            local.get 0
            i32.load offset=8
            local.set 3
          end
          local.get 0
          local.get 3
          i32.const 1
          i32.add
          i32.store offset=8
          local.get 0
          i32.load
          local.get 3
          i32.add
          local.get 1
          i32.store8
          br 2 (;@1;)
        end
        local.get 2
        local.get 1
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.store8 offset=13
        local.get 2
        local.get 1
        i32.const 6
        i32.shr_u
        i32.const 192
        i32.or
        i32.store8 offset=12
        i32.const 2
        local.set 1
      end
      block  ;; label = @2
        local.get 0
        i32.load offset=4
        local.get 0
        i32.load offset=8
        local.tee 3
        i32.sub
        local.get 1
        i32.ge_u
        br_if 0 (;@2;)
        local.get 0
        local.get 3
        local.get 1
        call $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$7reserve21do_reserve_and_handle17hcc5562826e1d69f5E
        local.get 0
        i32.load offset=8
        local.set 3
      end
      local.get 0
      i32.load
      local.get 3
      i32.add
      local.get 2
      i32.const 12
      i32.add
      local.get 1
      call $memcpy
      drop
      local.get 0
      local.get 3
      local.get 1
      i32.add
      i32.store offset=8
    end
    local.get 2
    i32.const 16
    i32.add
    global.set $__stack_pointer
    i32.const 0)
  (func $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$16reserve_for_push17h87349f4e2038b656E (type 0) (param i32 i32)
    (local i32 i32 i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.const 4
        i32.add
        i32.load
        local.tee 3
        i32.const 1
        i32.shl
        local.tee 4
        local.get 1
        local.get 4
        local.get 1
        i32.gt_u
        select
        local.tee 1
        i32.const 8
        local.get 1
        i32.const 8
        i32.gt_u
        select
        local.tee 1
        i32.const -1
        i32.xor
        i32.const 31
        i32.shr_u
        local.set 4
        block  ;; label = @3
          block  ;; label = @4
            local.get 3
            i32.eqz
            br_if 0 (;@4;)
            local.get 2
            local.get 3
            i32.store offset=24
            local.get 2
            i32.const 1
            i32.store offset=20
            local.get 2
            local.get 0
            i32.load
            i32.store offset=16
            br 1 (;@3;)
          end
          local.get 2
          i32.const 0
          i32.store offset=20
        end
        local.get 2
        local.get 4
        local.get 1
        local.get 2
        i32.const 16
        i32.add
        call $_ZN5alloc7raw_vec11finish_grow17h77ad956293c183dfE
        local.get 2
        i32.load offset=4
        local.set 3
        block  ;; label = @3
          local.get 2
          i32.load
          br_if 0 (;@3;)
          local.get 0
          local.get 3
          i32.store
          local.get 0
          i32.const 4
          i32.add
          local.get 1
          i32.store
          br 2 (;@1;)
        end
        local.get 3
        i32.const -2147483647
        i32.eq
        br_if 1 (;@1;)
        local.get 3
        i32.eqz
        br_if 0 (;@2;)
        local.get 3
        local.get 2
        i32.const 8
        i32.add
        i32.load
        call $_ZN5alloc5alloc18handle_alloc_error17hda4b1b4e18f53a00E
        unreachable
      end
      call $_ZN5alloc7raw_vec17capacity_overflow17h9db66c34eec3373bE
      unreachable
    end
    local.get 2
    i32.const 32
    i32.add
    global.set $__stack_pointer)
  (func $_ZN50_$LT$$RF$mut$u20$W$u20$as$u20$core..fmt..Write$GT$9write_fmt17hc0328aa8dce798ebE (type 2) (param i32 i32) (result i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    local.get 2
    local.get 0
    i32.load
    i32.store offset=12
    local.get 2
    i32.const 12
    i32.add
    i32.const 1049020
    local.get 1
    call $_ZN4core3fmt5write17hcc90208b612ee6d9E
    local.set 0
    local.get 2
    i32.const 16
    i32.add
    global.set $__stack_pointer
    local.get 0)
  (func $_ZN50_$LT$$RF$mut$u20$W$u20$as$u20$core..fmt..Write$GT$9write_str17h1d23482077b86a21E (type 1) (param i32 i32 i32) (result i32)
    (local i32)
    block  ;; label = @1
      local.get 0
      i32.load
      local.tee 0
      i32.load offset=4
      local.get 0
      i32.load offset=8
      local.tee 3
      i32.sub
      local.get 2
      i32.ge_u
      br_if 0 (;@1;)
      local.get 0
      local.get 3
      local.get 2
      call $_ZN5alloc7raw_vec19RawVec$LT$T$C$A$GT$7reserve21do_reserve_and_handle17hcc5562826e1d69f5E
      local.get 0
      i32.load offset=8
      local.set 3
    end
    local.get 0
    i32.load
    local.get 3
    i32.add
    local.get 1
    local.get 2
    call $memcpy
    drop
    local.get 0
    local.get 3
    local.get 2
    i32.add
    i32.store offset=8
    i32.const 0)
  (func $_ZN5alloc7raw_vec11finish_grow17h77ad956293c183dfE (type 6) (param i32 i32 i32 i32)
    (local i32)
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          i32.eqz
          br_if 0 (;@3;)
          local.get 2
          i32.const -1
          i32.le_s
          br_if 1 (;@2;)
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 3
                i32.load offset=4
                i32.eqz
                br_if 0 (;@6;)
                block  ;; label = @7
                  local.get 3
                  i32.const 8
                  i32.add
                  i32.load
                  local.tee 4
                  br_if 0 (;@7;)
                  block  ;; label = @8
                    local.get 2
                    br_if 0 (;@8;)
                    local.get 1
                    local.set 3
                    br 4 (;@4;)
                  end
                  i32.const 0
                  i32.load8_u offset=1052753
                  drop
                  br 2 (;@5;)
                end
                local.get 3
                i32.load
                local.get 4
                local.get 1
                local.get 2
                call $__rust_realloc
                local.set 3
                br 2 (;@4;)
              end
              block  ;; label = @6
                local.get 2
                br_if 0 (;@6;)
                local.get 1
                local.set 3
                br 2 (;@4;)
              end
              i32.const 0
              i32.load8_u offset=1052753
              drop
            end
            local.get 2
            local.get 1
            call $__rust_alloc
            local.set 3
          end
          block  ;; label = @4
            local.get 3
            i32.eqz
            br_if 0 (;@4;)
            local.get 0
            local.get 3
            i32.store offset=4
            local.get 0
            i32.const 8
            i32.add
            local.get 2
            i32.store
            local.get 0
            i32.const 0
            i32.store
            return
          end
          local.get 0
          local.get 1
          i32.store offset=4
          local.get 0
          i32.const 8
          i32.add
          local.get 2
          i32.store
          br 2 (;@1;)
        end
        local.get 0
        i32.const 0
        i32.store offset=4
        local.get 0
        i32.const 8
        i32.add
        local.get 2
        i32.store
        br 1 (;@1;)
      end
      local.get 0
      i32.const 0
      i32.store offset=4
    end
    local.get 0
    i32.const 1
    i32.store)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$13dispose_chunk17h1640b0255174d80bE (type 0) (param i32 i32)
    (local i32 i32 i32 i32)
    local.get 0
    local.get 1
    call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
    local.set 2
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          call $_ZN8dlmalloc8dlmalloc5Chunk6pinuse17h0679ab521de26961E
          br_if 0 (;@3;)
          local.get 0
          i32.load
          local.set 3
          block  ;; label = @4
            local.get 0
            call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
            br_if 0 (;@4;)
            local.get 3
            local.get 1
            i32.add
            local.set 1
            block  ;; label = @5
              local.get 0
              local.get 3
              call $_ZN8dlmalloc8dlmalloc5Chunk12minus_offset17h02a4b3658a047a83E
              local.tee 0
              i32.const 0
              i32.load offset=1053204
              i32.ne
              br_if 0 (;@5;)
              local.get 2
              i32.load offset=4
              i32.const 3
              i32.and
              i32.const 3
              i32.ne
              br_if 2 (;@3;)
              i32.const 0
              local.get 1
              i32.store offset=1053196
              local.get 0
              local.get 1
              local.get 2
              call $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E
              return
            end
            block  ;; label = @5
              local.get 3
              i32.const 256
              i32.lt_u
              br_if 0 (;@5;)
              local.get 0
              call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
              br 2 (;@3;)
            end
            block  ;; label = @5
              local.get 0
              i32.const 12
              i32.add
              i32.load
              local.tee 4
              local.get 0
              i32.const 8
              i32.add
              i32.load
              local.tee 5
              i32.eq
              br_if 0 (;@5;)
              local.get 5
              local.get 4
              i32.store offset=12
              local.get 4
              local.get 5
              i32.store offset=8
              br 2 (;@3;)
            end
            i32.const 0
            i32.const 0
            i32.load offset=1053188
            i32.const -2
            local.get 3
            i32.const 3
            i32.shr_u
            i32.rotl
            i32.and
            i32.store offset=1053188
            br 1 (;@3;)
          end
          i32.const 1052780
          local.get 0
          local.get 3
          i32.sub
          local.get 3
          local.get 1
          i32.add
          i32.const 16
          i32.add
          local.tee 0
          call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$4free17ha2e3d76ae283f292E
          i32.eqz
          br_if 1 (;@2;)
          i32.const 0
          i32.const 0
          i32.load offset=1053212
          local.get 0
          i32.sub
          i32.store offset=1053212
          return
        end
        block  ;; label = @3
          local.get 2
          call $_ZN8dlmalloc8dlmalloc5Chunk6cinuse17hda8b659400f2c355E
          i32.eqz
          br_if 0 (;@3;)
          local.get 0
          local.get 1
          local.get 2
          call $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E
          br 2 (;@1;)
        end
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            i32.const 0
            i32.load offset=1053208
            i32.eq
            br_if 0 (;@4;)
            local.get 2
            i32.const 0
            i32.load offset=1053204
            i32.eq
            br_if 1 (;@3;)
            local.get 2
            call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
            local.tee 3
            local.get 1
            i32.add
            local.set 1
            block  ;; label = @5
              block  ;; label = @6
                local.get 3
                i32.const 256
                i32.lt_u
                br_if 0 (;@6;)
                local.get 2
                call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
                br 1 (;@5;)
              end
              block  ;; label = @6
                local.get 2
                i32.const 12
                i32.add
                i32.load
                local.tee 4
                local.get 2
                i32.const 8
                i32.add
                i32.load
                local.tee 2
                i32.eq
                br_if 0 (;@6;)
                local.get 2
                local.get 4
                i32.store offset=12
                local.get 4
                local.get 2
                i32.store offset=8
                br 1 (;@5;)
              end
              i32.const 0
              i32.const 0
              i32.load offset=1053188
              i32.const -2
              local.get 3
              i32.const 3
              i32.shr_u
              i32.rotl
              i32.and
              i32.store offset=1053188
            end
            local.get 0
            local.get 1
            call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
            local.get 0
            i32.const 0
            i32.load offset=1053204
            i32.ne
            br_if 3 (;@1;)
            i32.const 0
            local.get 1
            i32.store offset=1053196
            br 2 (;@2;)
          end
          i32.const 0
          local.get 0
          i32.store offset=1053208
          i32.const 0
          i32.const 0
          i32.load offset=1053200
          local.get 1
          i32.add
          local.tee 1
          i32.store offset=1053200
          local.get 0
          local.get 1
          i32.const 1
          i32.or
          i32.store offset=4
          local.get 0
          i32.const 0
          i32.load offset=1053204
          i32.ne
          br_if 1 (;@2;)
          i32.const 0
          i32.const 0
          i32.store offset=1053196
          i32.const 0
          i32.const 0
          i32.store offset=1053204
          return
        end
        i32.const 0
        local.get 0
        i32.store offset=1053204
        i32.const 0
        i32.const 0
        i32.load offset=1053196
        local.get 1
        i32.add
        local.tee 1
        i32.store offset=1053196
        local.get 0
        local.get 1
        call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
        return
      end
      return
    end
    block  ;; label = @1
      local.get 1
      i32.const 256
      i32.lt_u
      br_if 0 (;@1;)
      local.get 0
      local.get 1
      call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E
      return
    end
    local.get 1
    i32.const -8
    i32.and
    i32.const 1052924
    i32.add
    local.set 2
    block  ;; label = @1
      block  ;; label = @2
        i32.const 0
        i32.load offset=1053188
        local.tee 3
        i32.const 1
        local.get 1
        i32.const 3
        i32.shr_u
        i32.shl
        local.tee 1
        i32.and
        i32.eqz
        br_if 0 (;@2;)
        local.get 2
        i32.load offset=8
        local.set 1
        br 1 (;@1;)
      end
      i32.const 0
      local.get 3
      local.get 1
      i32.or
      i32.store offset=1053188
      local.get 2
      local.set 1
    end
    local.get 2
    local.get 0
    i32.store offset=8
    local.get 1
    local.get 0
    i32.store offset=12
    local.get 0
    local.get 2
    i32.store offset=12
    local.get 0
    local.get 1
    i32.store offset=8)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E (type 3) (param i32)
    (local i32 i32 i32 i32 i32)
    local.get 0
    i32.load offset=24
    local.set 1
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          call $_ZN8dlmalloc8dlmalloc9TreeChunk4next17hd6b4dfb4c6a80285E
          local.get 0
          i32.ne
          br_if 0 (;@3;)
          local.get 0
          i32.const 20
          i32.const 16
          local.get 0
          i32.const 20
          i32.add
          local.tee 2
          i32.load
          local.tee 3
          select
          i32.add
          i32.load
          local.tee 4
          br_if 1 (;@2;)
          i32.const 0
          local.set 2
          br 2 (;@1;)
        end
        local.get 0
        call $_ZN8dlmalloc8dlmalloc9TreeChunk4prev17h1d513924dc250de7E
        local.tee 4
        local.get 0
        call $_ZN8dlmalloc8dlmalloc9TreeChunk4next17hd6b4dfb4c6a80285E
        local.tee 2
        call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
        i32.store offset=12
        local.get 2
        local.get 4
        call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
        i32.store offset=8
        br 1 (;@1;)
      end
      local.get 2
      local.get 0
      i32.const 16
      i32.add
      local.get 3
      select
      local.set 3
      loop  ;; label = @2
        local.get 3
        local.set 5
        local.get 4
        local.tee 2
        i32.const 20
        i32.add
        local.tee 4
        local.get 2
        i32.const 16
        i32.add
        local.get 4
        i32.load
        local.tee 4
        select
        local.set 3
        local.get 2
        i32.const 20
        i32.const 16
        local.get 4
        select
        i32.add
        i32.load
        local.tee 4
        br_if 0 (;@2;)
      end
      local.get 5
      i32.const 0
      i32.store
    end
    block  ;; label = @1
      local.get 1
      i32.eqz
      br_if 0 (;@1;)
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.load offset=28
          i32.const 2
          i32.shl
          i32.const 1052780
          i32.add
          local.tee 4
          i32.load
          local.get 0
          i32.eq
          br_if 0 (;@3;)
          local.get 1
          i32.const 16
          i32.const 20
          local.get 1
          i32.load offset=16
          local.get 0
          i32.eq
          select
          i32.add
          local.get 2
          i32.store
          local.get 2
          br_if 1 (;@2;)
          br 2 (;@1;)
        end
        local.get 4
        local.get 2
        i32.store
        local.get 2
        br_if 0 (;@2;)
        i32.const 0
        i32.const 0
        i32.load offset=1053192
        i32.const -2
        local.get 0
        i32.load offset=28
        i32.rotl
        i32.and
        i32.store offset=1053192
        return
      end
      local.get 2
      local.get 1
      i32.store offset=24
      block  ;; label = @2
        local.get 0
        i32.load offset=16
        local.tee 4
        i32.eqz
        br_if 0 (;@2;)
        local.get 2
        local.get 4
        i32.store offset=16
        local.get 4
        local.get 2
        i32.store offset=24
      end
      local.get 0
      i32.const 20
      i32.add
      i32.load
      local.tee 4
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      i32.const 20
      i32.add
      local.get 4
      i32.store
      local.get 4
      local.get 2
      i32.store offset=24
      return
    end)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E (type 0) (param i32 i32)
    (local i32 i32 i32 i32 i32)
    i32.const 0
    local.set 2
    block  ;; label = @1
      local.get 1
      i32.const 256
      i32.lt_u
      br_if 0 (;@1;)
      i32.const 31
      local.set 2
      local.get 1
      i32.const 16777215
      i32.gt_u
      br_if 0 (;@1;)
      local.get 1
      i32.const 6
      local.get 1
      i32.const 8
      i32.shr_u
      i32.clz
      local.tee 2
      i32.sub
      i32.shr_u
      i32.const 1
      i32.and
      local.get 2
      i32.const 1
      i32.shl
      i32.sub
      i32.const 62
      i32.add
      local.set 2
    end
    local.get 0
    i64.const 0
    i64.store offset=16 align=4
    local.get 0
    local.get 2
    i32.store offset=28
    local.get 2
    i32.const 2
    i32.shl
    i32.const 1052780
    i32.add
    local.set 3
    local.get 0
    call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
    local.set 4
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              i32.const 0
              i32.load offset=1053192
              local.tee 5
              i32.const 1
              local.get 2
              i32.shl
              local.tee 6
              i32.and
              i32.eqz
              br_if 0 (;@5;)
              local.get 3
              i32.load
              local.set 5
              local.get 2
              call $_ZN8dlmalloc8dlmalloc24leftshift_for_tree_index17heba1df7d748a2df6E
              local.set 2
              local.get 5
              call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
              call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
              local.get 1
              i32.ne
              br_if 1 (;@4;)
              local.get 5
              local.set 2
              br 2 (;@3;)
            end
            i32.const 0
            local.get 5
            local.get 6
            i32.or
            i32.store offset=1053192
            local.get 3
            local.get 0
            i32.store
            local.get 0
            local.get 3
            i32.store offset=24
            br 3 (;@1;)
          end
          local.get 1
          local.get 2
          i32.shl
          local.set 3
          loop  ;; label = @4
            local.get 5
            local.get 3
            i32.const 29
            i32.shr_u
            i32.const 4
            i32.and
            i32.add
            i32.const 16
            i32.add
            local.tee 6
            i32.load
            local.tee 2
            i32.eqz
            br_if 2 (;@2;)
            local.get 3
            i32.const 1
            i32.shl
            local.set 3
            local.get 2
            local.set 5
            local.get 2
            call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
            call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
            local.get 1
            i32.ne
            br_if 0 (;@4;)
          end
        end
        local.get 2
        call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
        local.tee 2
        i32.load offset=8
        local.tee 3
        local.get 4
        i32.store offset=12
        local.get 2
        local.get 4
        i32.store offset=8
        local.get 4
        local.get 2
        i32.store offset=12
        local.get 4
        local.get 3
        i32.store offset=8
        local.get 0
        i32.const 0
        i32.store offset=24
        return
      end
      local.get 6
      local.get 0
      i32.store
      local.get 0
      local.get 5
      i32.store offset=24
    end
    local.get 4
    local.get 4
    i32.store offset=8
    local.get 4
    local.get 4
    i32.store offset=12)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$23release_unused_segments17hd8c6f37d46c97cedE (type 10) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    i32.const 0
    local.set 0
    i32.const 0
    local.set 1
    block  ;; label = @1
      i32.const 0
      i32.load offset=1052916
      local.tee 2
      i32.eqz
      br_if 0 (;@1;)
      i32.const 1052908
      local.set 3
      i32.const 0
      local.set 1
      i32.const 0
      local.set 0
      loop  ;; label = @2
        local.get 2
        local.tee 4
        i32.load offset=8
        local.set 2
        local.get 4
        i32.load offset=4
        local.set 5
        local.get 4
        i32.load
        local.set 6
        block  ;; label = @3
          block  ;; label = @4
            i32.const 1052780
            local.get 4
            i32.load offset=12
            i32.const 1
            i32.shr_u
            call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$16can_release_part17h27973575abb48cb2E
            i32.eqz
            br_if 0 (;@4;)
            local.get 4
            call $_ZN8dlmalloc8dlmalloc7Segment9is_extern17had4bf3a4166f12c9E
            br_if 0 (;@4;)
            local.get 6
            local.get 6
            call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
            local.tee 7
            i32.const 8
            call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
            local.get 7
            i32.sub
            i32.add
            local.tee 7
            call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
            local.set 8
            call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
            local.tee 9
            i32.const 8
            call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
            local.set 10
            i32.const 20
            i32.const 8
            call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
            local.set 11
            i32.const 16
            i32.const 8
            call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
            local.set 12
            local.get 7
            call $_ZN8dlmalloc8dlmalloc5Chunk5inuse17hd8149ac8e52a6556E
            br_if 0 (;@4;)
            local.get 7
            local.get 8
            i32.add
            local.get 6
            local.get 9
            local.get 5
            i32.add
            local.get 10
            local.get 11
            i32.add
            local.get 12
            i32.add
            i32.sub
            i32.add
            i32.lt_u
            br_if 0 (;@4;)
            block  ;; label = @5
              block  ;; label = @6
                local.get 7
                i32.const 0
                i32.load offset=1053204
                i32.eq
                br_if 0 (;@6;)
                local.get 7
                call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
                br 1 (;@5;)
              end
              i32.const 0
              i32.const 0
              i32.store offset=1053196
              i32.const 0
              i32.const 0
              i32.store offset=1053204
            end
            block  ;; label = @5
              i32.const 1052780
              local.get 6
              local.get 5
              call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$4free17ha2e3d76ae283f292E
              br_if 0 (;@5;)
              local.get 7
              local.get 8
              call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E
              br 1 (;@4;)
            end
            i32.const 0
            i32.const 0
            i32.load offset=1053212
            local.get 5
            i32.sub
            i32.store offset=1053212
            local.get 3
            local.get 2
            i32.store offset=8
            local.get 5
            local.get 1
            i32.add
            local.set 1
            br 1 (;@3;)
          end
          local.get 4
          local.set 3
        end
        local.get 0
        i32.const 1
        i32.add
        local.set 0
        local.get 2
        br_if 0 (;@2;)
      end
    end
    i32.const 0
    local.get 0
    i32.const 4095
    local.get 0
    i32.const 4095
    i32.gt_u
    select
    i32.store offset=1053228
    local.get 1)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$4free17ha0e864b0bef7e6efE (type 3) (param i32)
    (local i32 i32 i32 i32 i32 i32)
    local.get 0
    call $_ZN8dlmalloc8dlmalloc5Chunk8from_mem17h50bd2ce5234141e6E
    local.set 0
    local.get 0
    local.get 0
    call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
    local.tee 1
    call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
    local.set 2
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        call $_ZN8dlmalloc8dlmalloc5Chunk6pinuse17h0679ab521de26961E
        br_if 0 (;@2;)
        local.get 0
        i32.load
        local.set 3
        block  ;; label = @3
          local.get 0
          call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
          br_if 0 (;@3;)
          local.get 3
          local.get 1
          i32.add
          local.set 1
          block  ;; label = @4
            local.get 0
            local.get 3
            call $_ZN8dlmalloc8dlmalloc5Chunk12minus_offset17h02a4b3658a047a83E
            local.tee 0
            i32.const 0
            i32.load offset=1053204
            i32.ne
            br_if 0 (;@4;)
            local.get 2
            i32.load offset=4
            i32.const 3
            i32.and
            i32.const 3
            i32.ne
            br_if 2 (;@2;)
            i32.const 0
            local.get 1
            i32.store offset=1053196
            local.get 0
            local.get 1
            local.get 2
            call $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E
            return
          end
          block  ;; label = @4
            local.get 3
            i32.const 256
            i32.lt_u
            br_if 0 (;@4;)
            local.get 0
            call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
            br 2 (;@2;)
          end
          block  ;; label = @4
            local.get 0
            i32.const 12
            i32.add
            i32.load
            local.tee 4
            local.get 0
            i32.const 8
            i32.add
            i32.load
            local.tee 5
            i32.eq
            br_if 0 (;@4;)
            local.get 5
            local.get 4
            i32.store offset=12
            local.get 4
            local.get 5
            i32.store offset=8
            br 2 (;@2;)
          end
          i32.const 0
          i32.const 0
          i32.load offset=1053188
          i32.const -2
          local.get 3
          i32.const 3
          i32.shr_u
          i32.rotl
          i32.and
          i32.store offset=1053188
          br 1 (;@2;)
        end
        i32.const 1052780
        local.get 0
        local.get 3
        i32.sub
        local.get 3
        local.get 1
        i32.add
        i32.const 16
        i32.add
        local.tee 0
        call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$4free17ha2e3d76ae283f292E
        i32.eqz
        br_if 1 (;@1;)
        i32.const 0
        i32.const 0
        i32.load offset=1053212
        local.get 0
        i32.sub
        i32.store offset=1053212
        return
      end
      block  ;; label = @2
        block  ;; label = @3
          local.get 2
          call $_ZN8dlmalloc8dlmalloc5Chunk6cinuse17hda8b659400f2c355E
          i32.eqz
          br_if 0 (;@3;)
          local.get 0
          local.get 1
          local.get 2
          call $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E
          br 1 (;@2;)
        end
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 2
                i32.const 0
                i32.load offset=1053208
                i32.eq
                br_if 0 (;@6;)
                local.get 2
                i32.const 0
                i32.load offset=1053204
                i32.eq
                br_if 1 (;@5;)
                local.get 2
                call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                local.tee 3
                local.get 1
                i32.add
                local.set 1
                block  ;; label = @7
                  block  ;; label = @8
                    local.get 3
                    i32.const 256
                    i32.lt_u
                    br_if 0 (;@8;)
                    local.get 2
                    call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
                    br 1 (;@7;)
                  end
                  block  ;; label = @8
                    local.get 2
                    i32.const 12
                    i32.add
                    i32.load
                    local.tee 4
                    local.get 2
                    i32.const 8
                    i32.add
                    i32.load
                    local.tee 2
                    i32.eq
                    br_if 0 (;@8;)
                    local.get 2
                    local.get 4
                    i32.store offset=12
                    local.get 4
                    local.get 2
                    i32.store offset=8
                    br 1 (;@7;)
                  end
                  i32.const 0
                  i32.const 0
                  i32.load offset=1053188
                  i32.const -2
                  local.get 3
                  i32.const 3
                  i32.shr_u
                  i32.rotl
                  i32.and
                  i32.store offset=1053188
                end
                local.get 0
                local.get 1
                call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
                local.get 0
                i32.const 0
                i32.load offset=1053204
                i32.ne
                br_if 4 (;@2;)
                i32.const 0
                local.get 1
                i32.store offset=1053196
                return
              end
              i32.const 0
              local.get 0
              i32.store offset=1053208
              i32.const 0
              i32.const 0
              i32.load offset=1053200
              local.get 1
              i32.add
              local.tee 1
              i32.store offset=1053200
              local.get 0
              local.get 1
              i32.const 1
              i32.or
              i32.store offset=4
              local.get 0
              i32.const 0
              i32.load offset=1053204
              i32.eq
              br_if 1 (;@4;)
              br 2 (;@3;)
            end
            i32.const 0
            local.get 0
            i32.store offset=1053204
            i32.const 0
            i32.const 0
            i32.load offset=1053196
            local.get 1
            i32.add
            local.tee 1
            i32.store offset=1053196
            local.get 0
            local.get 1
            call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
            return
          end
          i32.const 0
          i32.const 0
          i32.store offset=1053196
          i32.const 0
          i32.const 0
          i32.store offset=1053204
        end
        local.get 1
        i32.const 0
        i32.load offset=1053220
        i32.le_u
        br_if 1 (;@1;)
        call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
        local.tee 0
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 1
        i32.const 20
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 2
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 3
        i32.const 0
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        i32.const 2
        i32.shl
        i32.sub
        local.tee 4
        local.get 0
        local.get 3
        local.get 1
        local.get 2
        i32.add
        i32.add
        i32.sub
        i32.const -65544
        i32.add
        i32.const -9
        i32.and
        i32.const -3
        i32.add
        local.tee 0
        local.get 4
        local.get 0
        i32.lt_u
        select
        i32.eqz
        br_if 1 (;@1;)
        i32.const 0
        i32.load offset=1053208
        i32.eqz
        br_if 1 (;@1;)
        call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
        local.tee 0
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 1
        i32.const 20
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 3
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 4
        i32.const 0
        local.set 2
        block  ;; label = @3
          i32.const 0
          i32.load offset=1053200
          local.tee 5
          local.get 4
          local.get 3
          local.get 1
          local.get 0
          i32.sub
          i32.add
          i32.add
          local.tee 0
          i32.le_u
          br_if 0 (;@3;)
          local.get 5
          local.get 0
          i32.sub
          i32.const 65535
          i32.add
          i32.const -65536
          i32.and
          local.tee 4
          i32.const -65536
          i32.add
          local.set 3
          i32.const 0
          i32.load offset=1053208
          local.set 1
          i32.const 1052908
          local.set 0
          block  ;; label = @4
            loop  ;; label = @5
              block  ;; label = @6
                local.get 0
                i32.load
                local.get 1
                i32.gt_u
                br_if 0 (;@6;)
                local.get 0
                call $_ZN8dlmalloc8dlmalloc7Segment3top17h3564c5eabf6b59cfE
                local.get 1
                i32.gt_u
                br_if 2 (;@4;)
              end
              local.get 0
              i32.load offset=8
              local.tee 0
              br_if 0 (;@5;)
            end
            i32.const 0
            local.set 0
          end
          i32.const 0
          local.set 2
          local.get 0
          call $_ZN8dlmalloc8dlmalloc7Segment9is_extern17had4bf3a4166f12c9E
          br_if 0 (;@3;)
          i32.const 1052780
          local.get 0
          i32.load offset=12
          i32.const 1
          i32.shr_u
          call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$16can_release_part17h27973575abb48cb2E
          i32.eqz
          br_if 0 (;@3;)
          local.get 0
          i32.load offset=4
          local.get 3
          i32.lt_u
          br_if 0 (;@3;)
          i32.const 1052908
          local.set 1
          loop  ;; label = @4
            local.get 0
            local.get 1
            call $_ZN8dlmalloc8dlmalloc7Segment5holds17h19d235ec9132c568E
            br_if 1 (;@3;)
            local.get 1
            i32.load offset=8
            local.tee 1
            br_if 0 (;@4;)
          end
          i32.const 1052780
          local.get 0
          i32.load
          local.get 0
          i32.load offset=4
          local.tee 1
          local.get 1
          local.get 3
          i32.sub
          call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$9free_part17h70a0659286725f16E
          i32.eqz
          br_if 0 (;@3;)
          local.get 3
          i32.eqz
          br_if 0 (;@3;)
          local.get 0
          local.get 0
          i32.load offset=4
          local.get 3
          i32.sub
          i32.store offset=4
          i32.const 0
          i32.const 0
          i32.load offset=1053212
          local.get 3
          i32.sub
          i32.store offset=1053212
          i32.const 0
          i32.load offset=1053200
          local.set 1
          i32.const 0
          i32.load offset=1053208
          local.set 0
          i32.const 0
          local.get 0
          local.get 0
          call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
          local.tee 2
          i32.const 8
          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
          local.get 2
          i32.sub
          local.tee 2
          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
          local.tee 0
          i32.store offset=1053208
          i32.const 0
          local.get 1
          local.get 4
          local.get 2
          i32.add
          i32.sub
          i32.const 65536
          i32.add
          local.tee 1
          i32.store offset=1053200
          local.get 0
          local.get 1
          i32.const 1
          i32.or
          i32.store offset=4
          call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
          local.tee 2
          i32.const 8
          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
          local.set 4
          i32.const 20
          i32.const 8
          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
          local.set 5
          i32.const 16
          i32.const 8
          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
          local.set 6
          local.get 0
          local.get 1
          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
          local.get 6
          local.get 5
          local.get 4
          local.get 2
          i32.sub
          i32.add
          i32.add
          i32.store offset=4
          i32.const 0
          i32.const 2097152
          i32.store offset=1053220
          local.get 3
          local.set 2
        end
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$23release_unused_segments17hd8c6f37d46c97cedE
        i32.const 0
        local.get 2
        i32.sub
        i32.ne
        br_if 1 (;@1;)
        i32.const 0
        i32.load offset=1053200
        i32.const 0
        i32.load offset=1053220
        i32.le_u
        br_if 1 (;@1;)
        i32.const 0
        i32.const -1
        i32.store offset=1053220
        return
      end
      block  ;; label = @2
        local.get 1
        i32.const 256
        i32.lt_u
        br_if 0 (;@2;)
        local.get 0
        local.get 1
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E
        i32.const 0
        i32.const 0
        i32.load offset=1053228
        i32.const -1
        i32.add
        local.tee 0
        i32.store offset=1053228
        local.get 0
        br_if 1 (;@1;)
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$23release_unused_segments17hd8c6f37d46c97cedE
        drop
        return
      end
      local.get 1
      i32.const -8
      i32.and
      i32.const 1052924
      i32.add
      local.set 2
      block  ;; label = @2
        block  ;; label = @3
          i32.const 0
          i32.load offset=1053188
          local.tee 3
          i32.const 1
          local.get 1
          i32.const 3
          i32.shr_u
          i32.shl
          local.tee 1
          i32.and
          i32.eqz
          br_if 0 (;@3;)
          local.get 2
          i32.load offset=8
          local.set 1
          br 1 (;@2;)
        end
        i32.const 0
        local.get 3
        local.get 1
        i32.or
        i32.store offset=1053188
        local.get 2
        local.set 1
      end
      local.get 2
      local.get 0
      i32.store offset=8
      local.get 1
      local.get 0
      i32.store offset=12
      local.get 0
      local.get 2
      i32.store offset=12
      local.get 0
      local.get 1
      i32.store offset=8
    end)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$6malloc17h0bf488847bb20491E (type 7) (param i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i64)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 1
    global.set $__stack_pointer
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 0
                i32.const 245
                i32.lt_u
                br_if 0 (;@6;)
                call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
                local.tee 2
                i32.const 8
                call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                local.set 3
                i32.const 20
                i32.const 8
                call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                local.set 4
                i32.const 16
                i32.const 8
                call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                local.set 5
                i32.const 0
                local.set 6
                i32.const 0
                i32.const 16
                i32.const 8
                call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                i32.const 2
                i32.shl
                i32.sub
                local.tee 7
                local.get 2
                local.get 5
                local.get 3
                local.get 4
                i32.add
                i32.add
                i32.sub
                i32.const -65544
                i32.add
                i32.const -9
                i32.and
                i32.const -3
                i32.add
                local.tee 2
                local.get 7
                local.get 2
                i32.lt_u
                select
                local.get 0
                i32.le_u
                br_if 5 (;@1;)
                local.get 0
                i32.const 4
                i32.add
                i32.const 8
                call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                local.set 2
                i32.const 0
                i32.load offset=1053192
                i32.eqz
                br_if 4 (;@2;)
                i32.const 0
                local.set 8
                block  ;; label = @7
                  local.get 2
                  i32.const 256
                  i32.lt_u
                  br_if 0 (;@7;)
                  i32.const 31
                  local.set 8
                  local.get 2
                  i32.const 16777215
                  i32.gt_u
                  br_if 0 (;@7;)
                  local.get 2
                  i32.const 6
                  local.get 2
                  i32.const 8
                  i32.shr_u
                  i32.clz
                  local.tee 0
                  i32.sub
                  i32.shr_u
                  i32.const 1
                  i32.and
                  local.get 0
                  i32.const 1
                  i32.shl
                  i32.sub
                  i32.const 62
                  i32.add
                  local.set 8
                end
                i32.const 0
                local.get 2
                i32.sub
                local.set 6
                block  ;; label = @7
                  local.get 8
                  i32.const 2
                  i32.shl
                  i32.const 1052780
                  i32.add
                  i32.load
                  local.tee 3
                  br_if 0 (;@7;)
                  i32.const 0
                  local.set 0
                  i32.const 0
                  local.set 4
                  br 2 (;@5;)
                end
                local.get 2
                local.get 8
                call $_ZN8dlmalloc8dlmalloc24leftshift_for_tree_index17heba1df7d748a2df6E
                i32.shl
                local.set 5
                i32.const 0
                local.set 0
                i32.const 0
                local.set 4
                loop  ;; label = @7
                  block  ;; label = @8
                    local.get 3
                    call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
                    call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                    local.tee 7
                    local.get 2
                    i32.lt_u
                    br_if 0 (;@8;)
                    local.get 7
                    local.get 2
                    i32.sub
                    local.tee 7
                    local.get 6
                    i32.ge_u
                    br_if 0 (;@8;)
                    local.get 7
                    local.set 6
                    local.get 3
                    local.set 4
                    local.get 7
                    br_if 0 (;@8;)
                    i32.const 0
                    local.set 6
                    local.get 3
                    local.set 4
                    local.get 3
                    local.set 0
                    br 4 (;@4;)
                  end
                  local.get 3
                  i32.const 20
                  i32.add
                  i32.load
                  local.tee 7
                  local.get 0
                  local.get 7
                  local.get 3
                  local.get 5
                  i32.const 29
                  i32.shr_u
                  i32.const 4
                  i32.and
                  i32.add
                  i32.const 16
                  i32.add
                  i32.load
                  local.tee 3
                  i32.ne
                  select
                  local.get 0
                  local.get 7
                  select
                  local.set 0
                  local.get 5
                  i32.const 1
                  i32.shl
                  local.set 5
                  local.get 3
                  i32.eqz
                  br_if 2 (;@5;)
                  br 0 (;@7;)
                end
              end
              i32.const 16
              local.get 0
              i32.const 4
              i32.add
              i32.const 16
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              i32.const -5
              i32.add
              local.get 0
              i32.gt_u
              select
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              local.set 2
              block  ;; label = @6
                i32.const 0
                i32.load offset=1053188
                local.tee 4
                local.get 2
                i32.const 3
                i32.shr_u
                local.tee 6
                i32.shr_u
                local.tee 0
                i32.const 3
                i32.and
                i32.eqz
                br_if 0 (;@6;)
                block  ;; label = @7
                  block  ;; label = @8
                    local.get 0
                    i32.const -1
                    i32.xor
                    i32.const 1
                    i32.and
                    local.get 6
                    i32.add
                    local.tee 2
                    i32.const 3
                    i32.shl
                    local.tee 3
                    i32.const 1052932
                    i32.add
                    i32.load
                    local.tee 0
                    i32.const 8
                    i32.add
                    i32.load
                    local.tee 6
                    local.get 3
                    i32.const 1052924
                    i32.add
                    local.tee 3
                    i32.eq
                    br_if 0 (;@8;)
                    local.get 6
                    local.get 3
                    i32.store offset=12
                    local.get 3
                    local.get 6
                    i32.store offset=8
                    br 1 (;@7;)
                  end
                  i32.const 0
                  local.get 4
                  i32.const -2
                  local.get 2
                  i32.rotl
                  i32.and
                  i32.store offset=1053188
                end
                local.get 0
                local.get 2
                i32.const 3
                i32.shl
                call $_ZN8dlmalloc8dlmalloc5Chunk20set_inuse_and_pinuse17hbb34d80e5dc7393cE
                local.get 0
                call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                local.set 6
                br 5 (;@1;)
              end
              local.get 2
              i32.const 0
              i32.load offset=1053196
              i32.le_u
              br_if 3 (;@2;)
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          block  ;; label = @12
                            local.get 0
                            br_if 0 (;@12;)
                            i32.const 0
                            i32.load offset=1053192
                            local.tee 0
                            i32.eqz
                            br_if 10 (;@2;)
                            local.get 0
                            call $_ZN8dlmalloc8dlmalloc9least_bit17h8529bd9531fdaa56E
                            i32.ctz
                            i32.const 2
                            i32.shl
                            i32.const 1052780
                            i32.add
                            i32.load
                            local.tee 3
                            call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
                            call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                            local.get 2
                            i32.sub
                            local.set 6
                            block  ;; label = @13
                              local.get 3
                              call $_ZN8dlmalloc8dlmalloc9TreeChunk14leftmost_child17h1874651cab23213fE
                              local.tee 0
                              i32.eqz
                              br_if 0 (;@13;)
                              loop  ;; label = @14
                                local.get 0
                                call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
                                call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                                local.get 2
                                i32.sub
                                local.tee 4
                                local.get 6
                                local.get 4
                                local.get 6
                                i32.lt_u
                                local.tee 4
                                select
                                local.set 6
                                local.get 0
                                local.get 3
                                local.get 4
                                select
                                local.set 3
                                local.get 0
                                call $_ZN8dlmalloc8dlmalloc9TreeChunk14leftmost_child17h1874651cab23213fE
                                local.tee 0
                                br_if 0 (;@14;)
                              end
                            end
                            local.get 3
                            call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
                            local.tee 0
                            local.get 2
                            call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                            local.set 4
                            local.get 3
                            call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
                            local.get 6
                            i32.const 16
                            i32.const 8
                            call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                            i32.lt_u
                            br_if 2 (;@10;)
                            local.get 4
                            call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
                            local.set 4
                            local.get 0
                            local.get 2
                            call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
                            local.get 4
                            local.get 6
                            call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
                            i32.const 0
                            i32.load offset=1053196
                            local.tee 7
                            br_if 1 (;@11;)
                            br 5 (;@7;)
                          end
                          block  ;; label = @12
                            block  ;; label = @13
                              i32.const 1
                              local.get 6
                              i32.const 31
                              i32.and
                              local.tee 6
                              i32.shl
                              call $_ZN8dlmalloc8dlmalloc9left_bits17h2d3907410afd11a6E
                              local.get 0
                              local.get 6
                              i32.shl
                              i32.and
                              call $_ZN8dlmalloc8dlmalloc9least_bit17h8529bd9531fdaa56E
                              i32.ctz
                              local.tee 6
                              i32.const 3
                              i32.shl
                              local.tee 4
                              i32.const 1052932
                              i32.add
                              i32.load
                              local.tee 0
                              i32.const 8
                              i32.add
                              i32.load
                              local.tee 3
                              local.get 4
                              i32.const 1052924
                              i32.add
                              local.tee 4
                              i32.eq
                              br_if 0 (;@13;)
                              local.get 3
                              local.get 4
                              i32.store offset=12
                              local.get 4
                              local.get 3
                              i32.store offset=8
                              br 1 (;@12;)
                            end
                            i32.const 0
                            i32.const 0
                            i32.load offset=1053188
                            i32.const -2
                            local.get 6
                            i32.rotl
                            i32.and
                            i32.store offset=1053188
                          end
                          local.get 0
                          local.get 2
                          call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
                          local.get 0
                          local.get 2
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          local.tee 4
                          local.get 6
                          i32.const 3
                          i32.shl
                          local.get 2
                          i32.sub
                          local.tee 5
                          call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
                          i32.const 0
                          i32.load offset=1053196
                          local.tee 3
                          br_if 2 (;@9;)
                          br 3 (;@8;)
                        end
                        local.get 7
                        i32.const -8
                        i32.and
                        i32.const 1052924
                        i32.add
                        local.set 5
                        i32.const 0
                        i32.load offset=1053204
                        local.set 3
                        block  ;; label = @11
                          block  ;; label = @12
                            i32.const 0
                            i32.load offset=1053188
                            local.tee 8
                            i32.const 1
                            local.get 7
                            i32.const 3
                            i32.shr_u
                            i32.shl
                            local.tee 7
                            i32.and
                            i32.eqz
                            br_if 0 (;@12;)
                            local.get 5
                            i32.load offset=8
                            local.set 7
                            br 1 (;@11;)
                          end
                          i32.const 0
                          local.get 8
                          local.get 7
                          i32.or
                          i32.store offset=1053188
                          local.get 5
                          local.set 7
                        end
                        local.get 5
                        local.get 3
                        i32.store offset=8
                        local.get 7
                        local.get 3
                        i32.store offset=12
                        local.get 3
                        local.get 5
                        i32.store offset=12
                        local.get 3
                        local.get 7
                        i32.store offset=8
                        br 3 (;@7;)
                      end
                      local.get 0
                      local.get 6
                      local.get 2
                      i32.add
                      call $_ZN8dlmalloc8dlmalloc5Chunk20set_inuse_and_pinuse17hbb34d80e5dc7393cE
                      br 3 (;@6;)
                    end
                    local.get 3
                    i32.const -8
                    i32.and
                    i32.const 1052924
                    i32.add
                    local.set 6
                    i32.const 0
                    i32.load offset=1053204
                    local.set 2
                    block  ;; label = @9
                      block  ;; label = @10
                        i32.const 0
                        i32.load offset=1053188
                        local.tee 7
                        i32.const 1
                        local.get 3
                        i32.const 3
                        i32.shr_u
                        i32.shl
                        local.tee 3
                        i32.and
                        i32.eqz
                        br_if 0 (;@10;)
                        local.get 6
                        i32.load offset=8
                        local.set 3
                        br 1 (;@9;)
                      end
                      i32.const 0
                      local.get 7
                      local.get 3
                      i32.or
                      i32.store offset=1053188
                      local.get 6
                      local.set 3
                    end
                    local.get 6
                    local.get 2
                    i32.store offset=8
                    local.get 3
                    local.get 2
                    i32.store offset=12
                    local.get 2
                    local.get 6
                    i32.store offset=12
                    local.get 2
                    local.get 3
                    i32.store offset=8
                  end
                  i32.const 0
                  local.get 4
                  i32.store offset=1053204
                  i32.const 0
                  local.get 5
                  i32.store offset=1053196
                  local.get 0
                  call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                  local.set 6
                  br 6 (;@1;)
                end
                i32.const 0
                local.get 4
                i32.store offset=1053204
                i32.const 0
                local.get 6
                i32.store offset=1053196
              end
              local.get 0
              call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
              local.tee 6
              i32.eqz
              br_if 3 (;@2;)
              br 4 (;@1;)
            end
            block  ;; label = @5
              local.get 0
              local.get 4
              i32.or
              br_if 0 (;@5;)
              i32.const 0
              local.set 4
              i32.const 1
              local.get 8
              i32.shl
              call $_ZN8dlmalloc8dlmalloc9left_bits17h2d3907410afd11a6E
              i32.const 0
              i32.load offset=1053192
              i32.and
              local.tee 0
              i32.eqz
              br_if 3 (;@2;)
              local.get 0
              call $_ZN8dlmalloc8dlmalloc9least_bit17h8529bd9531fdaa56E
              i32.ctz
              i32.const 2
              i32.shl
              i32.const 1052780
              i32.add
              i32.load
              local.set 0
            end
            local.get 0
            i32.eqz
            br_if 1 (;@3;)
          end
          loop  ;; label = @4
            local.get 0
            local.get 4
            local.get 0
            call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
            call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
            local.tee 3
            local.get 2
            i32.ge_u
            local.get 3
            local.get 2
            i32.sub
            local.tee 3
            local.get 6
            i32.lt_u
            i32.and
            local.tee 5
            select
            local.set 4
            local.get 3
            local.get 6
            local.get 5
            select
            local.set 6
            local.get 0
            call $_ZN8dlmalloc8dlmalloc9TreeChunk14leftmost_child17h1874651cab23213fE
            local.tee 0
            br_if 0 (;@4;)
          end
        end
        local.get 4
        i32.eqz
        br_if 0 (;@2;)
        block  ;; label = @3
          i32.const 0
          i32.load offset=1053196
          local.tee 0
          local.get 2
          i32.lt_u
          br_if 0 (;@3;)
          local.get 6
          local.get 0
          local.get 2
          i32.sub
          i32.ge_u
          br_if 1 (;@2;)
        end
        local.get 4
        call $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE
        local.tee 0
        local.get 2
        call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
        local.set 3
        local.get 4
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
        block  ;; label = @3
          block  ;; label = @4
            local.get 6
            i32.const 16
            i32.const 8
            call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
            i32.lt_u
            br_if 0 (;@4;)
            local.get 0
            local.get 2
            call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
            local.get 3
            local.get 6
            call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
            block  ;; label = @5
              local.get 6
              i32.const 256
              i32.lt_u
              br_if 0 (;@5;)
              local.get 3
              local.get 6
              call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E
              br 2 (;@3;)
            end
            local.get 6
            i32.const -8
            i32.and
            i32.const 1052924
            i32.add
            local.set 4
            block  ;; label = @5
              block  ;; label = @6
                i32.const 0
                i32.load offset=1053188
                local.tee 5
                i32.const 1
                local.get 6
                i32.const 3
                i32.shr_u
                i32.shl
                local.tee 6
                i32.and
                i32.eqz
                br_if 0 (;@6;)
                local.get 4
                i32.load offset=8
                local.set 6
                br 1 (;@5;)
              end
              i32.const 0
              local.get 5
              local.get 6
              i32.or
              i32.store offset=1053188
              local.get 4
              local.set 6
            end
            local.get 4
            local.get 3
            i32.store offset=8
            local.get 6
            local.get 3
            i32.store offset=12
            local.get 3
            local.get 4
            i32.store offset=12
            local.get 3
            local.get 6
            i32.store offset=8
            br 1 (;@3;)
          end
          local.get 0
          local.get 6
          local.get 2
          i32.add
          call $_ZN8dlmalloc8dlmalloc5Chunk20set_inuse_and_pinuse17hbb34d80e5dc7393cE
        end
        local.get 0
        call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
        local.tee 6
        br_if 1 (;@1;)
      end
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      i32.const 0
                      i32.load offset=1053196
                      local.tee 6
                      local.get 2
                      i32.ge_u
                      br_if 0 (;@9;)
                      block  ;; label = @10
                        i32.const 0
                        i32.load offset=1053200
                        local.tee 0
                        local.get 2
                        i32.gt_u
                        br_if 0 (;@10;)
                        local.get 1
                        i32.const 1052780
                        local.get 2
                        call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
                        local.tee 0
                        i32.sub
                        local.get 0
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        i32.add
                        i32.const 20
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        i32.add
                        i32.const 16
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        i32.add
                        i32.const 8
                        i32.add
                        i32.const 65536
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$5alloc17h67c1aeecb07d49a8E
                        block  ;; label = @11
                          local.get 1
                          i32.load
                          local.tee 6
                          br_if 0 (;@11;)
                          i32.const 0
                          local.set 6
                          br 10 (;@1;)
                        end
                        local.get 1
                        i32.load offset=8
                        local.set 8
                        i32.const 0
                        i32.const 0
                        i32.load offset=1053212
                        local.get 1
                        i32.load offset=4
                        local.tee 5
                        i32.add
                        local.tee 0
                        i32.store offset=1053212
                        i32.const 0
                        i32.const 0
                        i32.load offset=1053216
                        local.tee 3
                        local.get 0
                        local.get 3
                        local.get 0
                        i32.gt_u
                        select
                        i32.store offset=1053216
                        block  ;; label = @11
                          block  ;; label = @12
                            block  ;; label = @13
                              i32.const 0
                              i32.load offset=1053208
                              i32.eqz
                              br_if 0 (;@13;)
                              i32.const 1052908
                              local.set 0
                              loop  ;; label = @14
                                local.get 6
                                local.get 0
                                call $_ZN8dlmalloc8dlmalloc7Segment3top17h3564c5eabf6b59cfE
                                i32.eq
                                br_if 2 (;@12;)
                                local.get 0
                                i32.load offset=8
                                local.tee 0
                                br_if 0 (;@14;)
                                br 3 (;@11;)
                              end
                            end
                            i32.const 0
                            i32.load offset=1053224
                            local.tee 0
                            i32.eqz
                            br_if 4 (;@8;)
                            local.get 6
                            local.get 0
                            i32.lt_u
                            br_if 4 (;@8;)
                            br 9 (;@3;)
                          end
                          local.get 0
                          call $_ZN8dlmalloc8dlmalloc7Segment9is_extern17had4bf3a4166f12c9E
                          br_if 0 (;@11;)
                          local.get 0
                          call $_ZN8dlmalloc8dlmalloc7Segment9sys_flags17h1d629ada7a9c5547E
                          local.get 8
                          i32.ne
                          br_if 0 (;@11;)
                          local.get 0
                          i32.const 0
                          i32.load offset=1053208
                          call $_ZN8dlmalloc8dlmalloc7Segment5holds17h19d235ec9132c568E
                          br_if 4 (;@7;)
                        end
                        i32.const 0
                        i32.const 0
                        i32.load offset=1053224
                        local.tee 0
                        local.get 6
                        local.get 6
                        local.get 0
                        i32.gt_u
                        select
                        i32.store offset=1053224
                        local.get 6
                        local.get 5
                        i32.add
                        local.set 3
                        i32.const 1052908
                        local.set 0
                        block  ;; label = @11
                          block  ;; label = @12
                            block  ;; label = @13
                              loop  ;; label = @14
                                local.get 0
                                i32.load
                                local.get 3
                                i32.eq
                                br_if 1 (;@13;)
                                local.get 0
                                i32.load offset=8
                                local.tee 0
                                br_if 0 (;@14;)
                                br 2 (;@12;)
                              end
                            end
                            local.get 0
                            call $_ZN8dlmalloc8dlmalloc7Segment9is_extern17had4bf3a4166f12c9E
                            br_if 0 (;@12;)
                            local.get 0
                            call $_ZN8dlmalloc8dlmalloc7Segment9sys_flags17h1d629ada7a9c5547E
                            local.get 8
                            i32.eq
                            br_if 1 (;@11;)
                          end
                          i32.const 0
                          i32.load offset=1053208
                          local.set 3
                          i32.const 1052908
                          local.set 0
                          block  ;; label = @12
                            loop  ;; label = @13
                              block  ;; label = @14
                                local.get 0
                                i32.load
                                local.get 3
                                i32.gt_u
                                br_if 0 (;@14;)
                                local.get 0
                                call $_ZN8dlmalloc8dlmalloc7Segment3top17h3564c5eabf6b59cfE
                                local.get 3
                                i32.gt_u
                                br_if 2 (;@12;)
                              end
                              local.get 0
                              i32.load offset=8
                              local.tee 0
                              br_if 0 (;@13;)
                            end
                            i32.const 0
                            local.set 0
                          end
                          local.get 0
                          call $_ZN8dlmalloc8dlmalloc7Segment3top17h3564c5eabf6b59cfE
                          local.tee 4
                          i32.const 20
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.tee 9
                          i32.sub
                          i32.const -23
                          i32.add
                          local.set 0
                          local.get 3
                          local.get 0
                          local.get 0
                          call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                          local.tee 7
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.get 7
                          i32.sub
                          i32.add
                          local.tee 0
                          local.get 0
                          local.get 3
                          i32.const 16
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          i32.add
                          i32.lt_u
                          select
                          local.tee 7
                          call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                          local.set 10
                          local.get 7
                          local.get 9
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          local.set 0
                          call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
                          local.tee 11
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.set 12
                          i32.const 20
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.set 13
                          i32.const 16
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.set 14
                          i32.const 0
                          local.get 6
                          local.get 6
                          call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                          local.tee 15
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.get 15
                          i32.sub
                          local.tee 16
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          local.tee 15
                          i32.store offset=1053208
                          i32.const 0
                          local.get 11
                          local.get 5
                          i32.add
                          local.get 14
                          local.get 12
                          local.get 13
                          i32.add
                          i32.add
                          local.get 16
                          i32.add
                          i32.sub
                          local.tee 11
                          i32.store offset=1053200
                          local.get 15
                          local.get 11
                          i32.const 1
                          i32.or
                          i32.store offset=4
                          call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
                          local.tee 12
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.set 13
                          i32.const 20
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.set 14
                          i32.const 16
                          i32.const 8
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.set 16
                          local.get 15
                          local.get 11
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          local.get 16
                          local.get 14
                          local.get 13
                          local.get 12
                          i32.sub
                          i32.add
                          i32.add
                          i32.store offset=4
                          i32.const 0
                          i32.const 2097152
                          i32.store offset=1053220
                          local.get 7
                          local.get 9
                          call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
                          i32.const 0
                          i64.load offset=1052908 align=4
                          local.set 17
                          local.get 10
                          i32.const 8
                          i32.add
                          i32.const 0
                          i64.load offset=1052916 align=4
                          i64.store align=4
                          local.get 10
                          local.get 17
                          i64.store align=4
                          i32.const 0
                          local.get 8
                          i32.store offset=1052920
                          i32.const 0
                          local.get 5
                          i32.store offset=1052912
                          i32.const 0
                          local.get 6
                          i32.store offset=1052908
                          i32.const 0
                          local.get 10
                          i32.store offset=1052916
                          loop  ;; label = @12
                            local.get 0
                            i32.const 4
                            call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                            local.set 6
                            local.get 0
                            call $_ZN8dlmalloc8dlmalloc5Chunk14fencepost_head17h36c185cc5c557ae9E
                            i32.store offset=4
                            local.get 6
                            local.set 0
                            local.get 6
                            i32.const 4
                            i32.add
                            local.get 4
                            i32.lt_u
                            br_if 0 (;@12;)
                          end
                          local.get 7
                          local.get 3
                          i32.eq
                          br_if 9 (;@2;)
                          local.get 7
                          local.get 3
                          i32.sub
                          local.set 0
                          local.get 3
                          local.get 0
                          local.get 3
                          local.get 0
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          call $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E
                          block  ;; label = @12
                            local.get 0
                            i32.const 256
                            i32.lt_u
                            br_if 0 (;@12;)
                            local.get 3
                            local.get 0
                            call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E
                            br 10 (;@2;)
                          end
                          local.get 0
                          i32.const -8
                          i32.and
                          i32.const 1052924
                          i32.add
                          local.set 6
                          block  ;; label = @12
                            block  ;; label = @13
                              i32.const 0
                              i32.load offset=1053188
                              local.tee 4
                              i32.const 1
                              local.get 0
                              i32.const 3
                              i32.shr_u
                              i32.shl
                              local.tee 0
                              i32.and
                              i32.eqz
                              br_if 0 (;@13;)
                              local.get 6
                              i32.load offset=8
                              local.set 0
                              br 1 (;@12;)
                            end
                            i32.const 0
                            local.get 4
                            local.get 0
                            i32.or
                            i32.store offset=1053188
                            local.get 6
                            local.set 0
                          end
                          local.get 6
                          local.get 3
                          i32.store offset=8
                          local.get 0
                          local.get 3
                          i32.store offset=12
                          local.get 3
                          local.get 6
                          i32.store offset=12
                          local.get 3
                          local.get 0
                          i32.store offset=8
                          br 9 (;@2;)
                        end
                        local.get 0
                        i32.load
                        local.set 4
                        local.get 0
                        local.get 6
                        i32.store
                        local.get 0
                        local.get 0
                        i32.load offset=4
                        local.get 5
                        i32.add
                        i32.store offset=4
                        local.get 6
                        call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                        local.tee 0
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        local.set 3
                        local.get 4
                        call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                        local.tee 5
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        local.set 7
                        local.get 6
                        local.get 3
                        local.get 0
                        i32.sub
                        i32.add
                        local.tee 6
                        local.get 2
                        call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                        local.set 3
                        local.get 6
                        local.get 2
                        call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
                        local.get 4
                        local.get 7
                        local.get 5
                        i32.sub
                        i32.add
                        local.tee 0
                        local.get 2
                        local.get 6
                        i32.add
                        i32.sub
                        local.set 2
                        block  ;; label = @11
                          local.get 0
                          i32.const 0
                          i32.load offset=1053208
                          i32.eq
                          br_if 0 (;@11;)
                          local.get 0
                          i32.const 0
                          i32.load offset=1053204
                          i32.eq
                          br_if 5 (;@6;)
                          local.get 0
                          call $_ZN8dlmalloc8dlmalloc5Chunk5inuse17hd8149ac8e52a6556E
                          br_if 7 (;@4;)
                          block  ;; label = @12
                            block  ;; label = @13
                              local.get 0
                              call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                              local.tee 4
                              i32.const 256
                              i32.lt_u
                              br_if 0 (;@13;)
                              local.get 0
                              call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
                              br 1 (;@12;)
                            end
                            block  ;; label = @13
                              local.get 0
                              i32.const 12
                              i32.add
                              i32.load
                              local.tee 5
                              local.get 0
                              i32.const 8
                              i32.add
                              i32.load
                              local.tee 7
                              i32.eq
                              br_if 0 (;@13;)
                              local.get 7
                              local.get 5
                              i32.store offset=12
                              local.get 5
                              local.get 7
                              i32.store offset=8
                              br 1 (;@12;)
                            end
                            i32.const 0
                            i32.const 0
                            i32.load offset=1053188
                            i32.const -2
                            local.get 4
                            i32.const 3
                            i32.shr_u
                            i32.rotl
                            i32.and
                            i32.store offset=1053188
                          end
                          local.get 4
                          local.get 2
                          i32.add
                          local.set 2
                          local.get 0
                          local.get 4
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          local.set 0
                          br 7 (;@4;)
                        end
                        i32.const 0
                        local.get 3
                        i32.store offset=1053208
                        i32.const 0
                        i32.const 0
                        i32.load offset=1053200
                        local.get 2
                        i32.add
                        local.tee 0
                        i32.store offset=1053200
                        local.get 3
                        local.get 0
                        i32.const 1
                        i32.or
                        i32.store offset=4
                        local.get 6
                        call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                        local.set 6
                        br 9 (;@1;)
                      end
                      i32.const 0
                      local.get 0
                      local.get 2
                      i32.sub
                      local.tee 6
                      i32.store offset=1053200
                      i32.const 0
                      i32.const 0
                      i32.load offset=1053208
                      local.tee 0
                      local.get 2
                      call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                      local.tee 3
                      i32.store offset=1053208
                      local.get 3
                      local.get 6
                      i32.const 1
                      i32.or
                      i32.store offset=4
                      local.get 0
                      local.get 2
                      call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
                      local.get 0
                      call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                      local.set 6
                      br 8 (;@1;)
                    end
                    i32.const 0
                    i32.load offset=1053204
                    local.set 0
                    local.get 6
                    local.get 2
                    i32.sub
                    local.tee 6
                    i32.const 16
                    i32.const 8
                    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                    i32.lt_u
                    br_if 3 (;@5;)
                    local.get 0
                    local.get 2
                    call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                    local.set 3
                    i32.const 0
                    local.get 6
                    i32.store offset=1053196
                    i32.const 0
                    local.get 3
                    i32.store offset=1053204
                    local.get 3
                    local.get 6
                    call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
                    local.get 0
                    local.get 2
                    call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
                    local.get 0
                    call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
                    local.set 6
                    br 7 (;@1;)
                  end
                  i32.const 0
                  local.get 6
                  i32.store offset=1053224
                  br 4 (;@3;)
                end
                local.get 0
                local.get 0
                i32.load offset=4
                local.get 5
                i32.add
                i32.store offset=4
                i32.const 0
                i32.load offset=1053208
                i32.const 0
                i32.load offset=1053200
                local.get 5
                i32.add
                call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$8init_top17h6a6b910dc2c75d4cE
                br 4 (;@2;)
              end
              i32.const 0
              local.get 3
              i32.store offset=1053204
              i32.const 0
              i32.const 0
              i32.load offset=1053196
              local.get 2
              i32.add
              local.tee 0
              i32.store offset=1053196
              local.get 3
              local.get 0
              call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
              local.get 6
              call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
              local.set 6
              br 4 (;@1;)
            end
            i32.const 0
            i32.const 0
            i32.store offset=1053204
            i32.const 0
            i32.load offset=1053196
            local.set 2
            i32.const 0
            i32.const 0
            i32.store offset=1053196
            local.get 0
            local.get 2
            call $_ZN8dlmalloc8dlmalloc5Chunk20set_inuse_and_pinuse17hbb34d80e5dc7393cE
            local.get 0
            call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
            local.set 6
            br 3 (;@1;)
          end
          local.get 3
          local.get 2
          local.get 0
          call $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E
          block  ;; label = @4
            local.get 2
            i32.const 256
            i32.lt_u
            br_if 0 (;@4;)
            local.get 3
            local.get 2
            call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18insert_large_chunk17hf7e4f63de4a87870E
            local.get 6
            call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
            local.set 6
            br 3 (;@1;)
          end
          local.get 2
          i32.const -8
          i32.and
          i32.const 1052924
          i32.add
          local.set 0
          block  ;; label = @4
            block  ;; label = @5
              i32.const 0
              i32.load offset=1053188
              local.tee 4
              i32.const 1
              local.get 2
              i32.const 3
              i32.shr_u
              i32.shl
              local.tee 2
              i32.and
              i32.eqz
              br_if 0 (;@5;)
              local.get 0
              i32.load offset=8
              local.set 2
              br 1 (;@4;)
            end
            i32.const 0
            local.get 4
            local.get 2
            i32.or
            i32.store offset=1053188
            local.get 0
            local.set 2
          end
          local.get 0
          local.get 3
          i32.store offset=8
          local.get 2
          local.get 3
          i32.store offset=12
          local.get 3
          local.get 0
          i32.store offset=12
          local.get 3
          local.get 2
          i32.store offset=8
          local.get 6
          call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
          local.set 6
          br 2 (;@1;)
        end
        i32.const 0
        i32.const 4095
        i32.store offset=1053228
        i32.const 0
        local.get 8
        i32.store offset=1052920
        i32.const 0
        local.get 5
        i32.store offset=1052912
        i32.const 0
        local.get 6
        i32.store offset=1052908
        i32.const 0
        i32.const 1052924
        i32.store offset=1052936
        i32.const 0
        i32.const 1052932
        i32.store offset=1052944
        i32.const 0
        i32.const 1052924
        i32.store offset=1052932
        i32.const 0
        i32.const 1052940
        i32.store offset=1052952
        i32.const 0
        i32.const 1052932
        i32.store offset=1052940
        i32.const 0
        i32.const 1052948
        i32.store offset=1052960
        i32.const 0
        i32.const 1052940
        i32.store offset=1052948
        i32.const 0
        i32.const 1052956
        i32.store offset=1052968
        i32.const 0
        i32.const 1052948
        i32.store offset=1052956
        i32.const 0
        i32.const 1052964
        i32.store offset=1052976
        i32.const 0
        i32.const 1052956
        i32.store offset=1052964
        i32.const 0
        i32.const 1052972
        i32.store offset=1052984
        i32.const 0
        i32.const 1052964
        i32.store offset=1052972
        i32.const 0
        i32.const 1052980
        i32.store offset=1052992
        i32.const 0
        i32.const 1052972
        i32.store offset=1052980
        i32.const 0
        i32.const 1052988
        i32.store offset=1053000
        i32.const 0
        i32.const 1052980
        i32.store offset=1052988
        i32.const 0
        i32.const 1052988
        i32.store offset=1052996
        i32.const 0
        i32.const 1052996
        i32.store offset=1053008
        i32.const 0
        i32.const 1052996
        i32.store offset=1053004
        i32.const 0
        i32.const 1053004
        i32.store offset=1053016
        i32.const 0
        i32.const 1053004
        i32.store offset=1053012
        i32.const 0
        i32.const 1053012
        i32.store offset=1053024
        i32.const 0
        i32.const 1053012
        i32.store offset=1053020
        i32.const 0
        i32.const 1053020
        i32.store offset=1053032
        i32.const 0
        i32.const 1053020
        i32.store offset=1053028
        i32.const 0
        i32.const 1053028
        i32.store offset=1053040
        i32.const 0
        i32.const 1053028
        i32.store offset=1053036
        i32.const 0
        i32.const 1053036
        i32.store offset=1053048
        i32.const 0
        i32.const 1053036
        i32.store offset=1053044
        i32.const 0
        i32.const 1053044
        i32.store offset=1053056
        i32.const 0
        i32.const 1053044
        i32.store offset=1053052
        i32.const 0
        i32.const 1053052
        i32.store offset=1053064
        i32.const 0
        i32.const 1053060
        i32.store offset=1053072
        i32.const 0
        i32.const 1053052
        i32.store offset=1053060
        i32.const 0
        i32.const 1053068
        i32.store offset=1053080
        i32.const 0
        i32.const 1053060
        i32.store offset=1053068
        i32.const 0
        i32.const 1053076
        i32.store offset=1053088
        i32.const 0
        i32.const 1053068
        i32.store offset=1053076
        i32.const 0
        i32.const 1053084
        i32.store offset=1053096
        i32.const 0
        i32.const 1053076
        i32.store offset=1053084
        i32.const 0
        i32.const 1053092
        i32.store offset=1053104
        i32.const 0
        i32.const 1053084
        i32.store offset=1053092
        i32.const 0
        i32.const 1053100
        i32.store offset=1053112
        i32.const 0
        i32.const 1053092
        i32.store offset=1053100
        i32.const 0
        i32.const 1053108
        i32.store offset=1053120
        i32.const 0
        i32.const 1053100
        i32.store offset=1053108
        i32.const 0
        i32.const 1053116
        i32.store offset=1053128
        i32.const 0
        i32.const 1053108
        i32.store offset=1053116
        i32.const 0
        i32.const 1053124
        i32.store offset=1053136
        i32.const 0
        i32.const 1053116
        i32.store offset=1053124
        i32.const 0
        i32.const 1053132
        i32.store offset=1053144
        i32.const 0
        i32.const 1053124
        i32.store offset=1053132
        i32.const 0
        i32.const 1053140
        i32.store offset=1053152
        i32.const 0
        i32.const 1053132
        i32.store offset=1053140
        i32.const 0
        i32.const 1053148
        i32.store offset=1053160
        i32.const 0
        i32.const 1053140
        i32.store offset=1053148
        i32.const 0
        i32.const 1053156
        i32.store offset=1053168
        i32.const 0
        i32.const 1053148
        i32.store offset=1053156
        i32.const 0
        i32.const 1053164
        i32.store offset=1053176
        i32.const 0
        i32.const 1053156
        i32.store offset=1053164
        i32.const 0
        i32.const 1053172
        i32.store offset=1053184
        i32.const 0
        i32.const 1053164
        i32.store offset=1053172
        i32.const 0
        i32.const 1053172
        i32.store offset=1053180
        call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
        local.tee 3
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 4
        i32.const 20
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 7
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 8
        i32.const 0
        local.get 6
        local.get 6
        call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
        local.tee 0
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.get 0
        i32.sub
        local.tee 10
        call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
        local.tee 0
        i32.store offset=1053208
        i32.const 0
        local.get 3
        local.get 5
        i32.add
        local.get 8
        local.get 4
        local.get 7
        i32.add
        i32.add
        local.get 10
        i32.add
        i32.sub
        local.tee 6
        i32.store offset=1053200
        local.get 0
        local.get 6
        i32.const 1
        i32.or
        i32.store offset=4
        call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
        local.tee 3
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 4
        i32.const 20
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 5
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 7
        local.get 0
        local.get 6
        call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
        local.get 7
        local.get 5
        local.get 4
        local.get 3
        i32.sub
        i32.add
        i32.add
        i32.store offset=4
        i32.const 0
        i32.const 2097152
        i32.store offset=1053220
      end
      i32.const 0
      local.set 6
      i32.const 0
      i32.load offset=1053200
      local.tee 0
      local.get 2
      i32.le_u
      br_if 0 (;@1;)
      i32.const 0
      local.get 0
      local.get 2
      i32.sub
      local.tee 6
      i32.store offset=1053200
      i32.const 0
      i32.const 0
      i32.load offset=1053208
      local.tee 0
      local.get 2
      call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
      local.tee 3
      i32.store offset=1053208
      local.get 3
      local.get 6
      i32.const 1
      i32.or
      i32.store offset=4
      local.get 0
      local.get 2
      call $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E
      local.get 0
      call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
      local.set 6
    end
    local.get 1
    i32.const 16
    i32.add
    global.set $__stack_pointer
    local.get 6)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$8init_top17h6a6b910dc2c75d4cE (type 0) (param i32 i32)
    (local i32 i32 i32 i32)
    local.get 0
    local.get 0
    call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
    local.tee 2
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.get 2
    i32.sub
    local.tee 2
    call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
    local.set 0
    i32.const 0
    local.get 1
    local.get 2
    i32.sub
    local.tee 1
    i32.store offset=1053200
    i32.const 0
    local.get 0
    i32.store offset=1053208
    local.get 0
    local.get 1
    i32.const 1
    i32.or
    i32.store offset=4
    call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
    local.tee 2
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.set 3
    i32.const 20
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.set 4
    i32.const 16
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.set 5
    local.get 0
    local.get 1
    call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
    local.get 5
    local.get 4
    local.get 3
    local.get 2
    i32.sub
    i32.add
    i32.add
    i32.store offset=4
    i32.const 0
    i32.const 2097152
    i32.store offset=1053220)
  (func $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$8memalign17h5a4b58422e067547E (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      i32.const 16
      i32.const 8
      call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
      local.get 0
      i32.le_u
      br_if 0 (;@1;)
      i32.const 16
      i32.const 8
      call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
      local.set 0
    end
    call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
    local.tee 2
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.set 3
    i32.const 20
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.set 4
    i32.const 16
    i32.const 8
    call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
    local.set 5
    i32.const 0
    local.set 6
    block  ;; label = @1
      i32.const 0
      i32.const 16
      i32.const 8
      call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
      i32.const 2
      i32.shl
      i32.sub
      local.tee 7
      local.get 2
      local.get 5
      local.get 3
      local.get 4
      i32.add
      i32.add
      i32.sub
      i32.const -65544
      i32.add
      i32.const -9
      i32.and
      i32.const -3
      i32.add
      local.tee 2
      local.get 7
      local.get 2
      i32.lt_u
      select
      local.get 0
      i32.sub
      local.get 1
      i32.le_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 16
      local.get 1
      i32.const 4
      i32.add
      i32.const 16
      i32.const 8
      call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
      i32.const -5
      i32.add
      local.get 1
      i32.gt_u
      select
      i32.const 8
      call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
      local.tee 3
      i32.add
      i32.const 16
      i32.const 8
      call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
      i32.add
      i32.const -4
      i32.add
      call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$6malloc17h0bf488847bb20491E
      local.tee 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      call $_ZN8dlmalloc8dlmalloc5Chunk8from_mem17h50bd2ce5234141e6E
      local.set 1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.const -1
          i32.add
          local.tee 6
          local.get 2
          i32.and
          br_if 0 (;@3;)
          local.get 1
          local.set 0
          br 1 (;@2;)
        end
        local.get 6
        local.get 2
        i32.add
        i32.const 0
        local.get 0
        i32.sub
        i32.and
        call $_ZN8dlmalloc8dlmalloc5Chunk8from_mem17h50bd2ce5234141e6E
        local.set 6
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.set 2
        local.get 1
        call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
        local.get 6
        i32.const 0
        local.get 0
        local.get 6
        local.get 1
        i32.sub
        local.get 2
        i32.gt_u
        select
        i32.add
        local.tee 0
        local.get 1
        i32.sub
        local.tee 6
        i32.sub
        local.set 2
        block  ;; label = @3
          local.get 1
          call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
          br_if 0 (;@3;)
          local.get 0
          local.get 2
          call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
          local.get 1
          local.get 6
          call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
          local.get 1
          local.get 6
          call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$13dispose_chunk17h1640b0255174d80bE
          br 1 (;@2;)
        end
        local.get 1
        i32.load
        local.set 1
        local.get 0
        local.get 2
        i32.store offset=4
        local.get 0
        local.get 1
        local.get 6
        i32.add
        i32.store
      end
      block  ;; label = @2
        local.get 0
        call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
        br_if 0 (;@2;)
        local.get 0
        call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
        local.tee 1
        i32.const 16
        i32.const 8
        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
        local.get 3
        i32.add
        i32.le_u
        br_if 0 (;@2;)
        local.get 0
        local.get 3
        call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
        local.set 6
        local.get 0
        local.get 3
        call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
        local.get 6
        local.get 1
        local.get 3
        i32.sub
        local.tee 1
        call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
        local.get 6
        local.get 1
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$13dispose_chunk17h1640b0255174d80bE
      end
      local.get 0
      call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E
      local.set 6
      local.get 0
      call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
      drop
    end
    local.get 6)
  (func $_ZN3std10sys_common9backtrace26__rust_end_short_backtrace17hae3977477626e3caE (type 3) (param i32)
    local.get 0
    call $_ZN3std9panicking19begin_panic_handler28_$u7b$$u7b$closure$u7d$$u7d$17h6485c3904f95718dE
    unreachable)
  (func $_ZN3std9panicking19begin_panic_handler28_$u7b$$u7b$closure$u7d$$u7d$17h6485c3904f95718dE (type 3) (param i32)
    (local i32 i32 i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 1
    global.set $__stack_pointer
    local.get 0
    i32.load
    local.tee 2
    i32.const 12
    i32.add
    i32.load
    local.set 3
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            i32.load offset=4
            br_table 0 (;@4;) 1 (;@3;) 3 (;@1;)
          end
          local.get 3
          br_if 2 (;@1;)
          i32.const 1049044
          local.set 2
          i32.const 0
          local.set 3
          br 1 (;@2;)
        end
        local.get 3
        br_if 1 (;@1;)
        local.get 2
        i32.load
        local.tee 2
        i32.load offset=4
        local.set 3
        local.get 2
        i32.load
        local.set 2
      end
      local.get 1
      local.get 3
      i32.store offset=4
      local.get 1
      local.get 2
      i32.store
      local.get 1
      i32.const 1049272
      local.get 0
      i32.load offset=4
      local.tee 2
      call $_ZN4core5panic10panic_info9PanicInfo7message17h5320e6c2c0b4337cE
      local.get 0
      i32.load offset=8
      local.get 2
      call $_ZN4core5panic10panic_info9PanicInfo10can_unwind17h83aa558ac009d718E
      call $_ZN3std9panicking20rust_panic_with_hook17h80ff9e1005fd6704E
      unreachable
    end
    local.get 1
    i32.const 0
    i32.store offset=4
    local.get 1
    local.get 2
    i32.store
    local.get 1
    i32.const 1049292
    local.get 0
    i32.load offset=4
    local.tee 2
    call $_ZN4core5panic10panic_info9PanicInfo7message17h5320e6c2c0b4337cE
    local.get 0
    i32.load offset=8
    local.get 2
    call $_ZN4core5panic10panic_info9PanicInfo10can_unwind17h83aa558ac009d718E
    call $_ZN3std9panicking20rust_panic_with_hook17h80ff9e1005fd6704E
    unreachable)
  (func $_ZN3std5alloc24default_alloc_error_hook17h3fb6eb051cd21889E (type 0) (param i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    block  ;; label = @1
      i32.const 0
      i32.load8_u offset=1052752
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      i32.const 20
      i32.add
      i64.const 1
      i64.store align=4
      local.get 2
      i32.const 2
      i32.store offset=12
      local.get 2
      i32.const 1049124
      i32.store offset=8
      local.get 2
      i32.const 2
      i32.store offset=36
      local.get 2
      local.get 1
      i32.store offset=44
      local.get 2
      local.get 2
      i32.const 32
      i32.add
      i32.store offset=16
      local.get 2
      local.get 2
      i32.const 44
      i32.add
      i32.store offset=32
      local.get 2
      i32.const 8
      i32.add
      i32.const 1049164
      call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
      unreachable
    end
    local.get 2
    i32.const 48
    i32.add
    global.set $__stack_pointer)
  (func $__rdl_alloc (type 2) (param i32 i32) (result i32)
    block  ;; label = @1
      local.get 1
      i32.const 9
      i32.lt_u
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$8memalign17h5a4b58422e067547E
      return
    end
    local.get 0
    call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$6malloc17h0bf488847bb20491E)
  (func $__rdl_dealloc (type 4) (param i32 i32 i32)
    local.get 0
    call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$4free17ha0e864b0bef7e6efE)
  (func $__rdl_realloc (type 5) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 2
                i32.const 9
                i32.lt_u
                br_if 0 (;@6;)
                local.get 2
                local.get 3
                call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$8memalign17h5a4b58422e067547E
                local.tee 2
                br_if 1 (;@5;)
                i32.const 0
                return
              end
              call $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE
              local.tee 1
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              local.set 4
              i32.const 20
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              local.set 5
              i32.const 16
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              local.set 6
              i32.const 0
              local.set 2
              i32.const 0
              i32.const 16
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              i32.const 2
              i32.shl
              i32.sub
              local.tee 7
              local.get 1
              local.get 6
              local.get 4
              local.get 5
              i32.add
              i32.add
              i32.sub
              i32.const -65544
              i32.add
              i32.const -9
              i32.and
              i32.const -3
              i32.add
              local.tee 1
              local.get 7
              local.get 1
              i32.lt_u
              select
              local.get 3
              i32.le_u
              br_if 3 (;@2;)
              i32.const 16
              local.get 3
              i32.const 4
              i32.add
              i32.const 16
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              i32.const -5
              i32.add
              local.get 3
              i32.gt_u
              select
              i32.const 8
              call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
              local.set 4
              local.get 0
              call $_ZN8dlmalloc8dlmalloc5Chunk8from_mem17h50bd2ce5234141e6E
              local.set 1
              local.get 1
              local.get 1
              call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
              local.tee 5
              call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
              local.set 6
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          block  ;; label = @12
                            local.get 1
                            call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
                            br_if 0 (;@12;)
                            local.get 5
                            local.get 4
                            i32.ge_u
                            br_if 4 (;@8;)
                            local.get 6
                            i32.const 0
                            i32.load offset=1053208
                            i32.eq
                            br_if 6 (;@6;)
                            local.get 6
                            i32.const 0
                            i32.load offset=1053204
                            i32.eq
                            br_if 3 (;@9;)
                            local.get 6
                            call $_ZN8dlmalloc8dlmalloc5Chunk6cinuse17hda8b659400f2c355E
                            br_if 9 (;@3;)
                            local.get 6
                            call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                            local.tee 7
                            local.get 5
                            i32.add
                            local.tee 5
                            local.get 4
                            i32.lt_u
                            br_if 9 (;@3;)
                            local.get 5
                            local.get 4
                            i32.sub
                            local.set 8
                            local.get 7
                            i32.const 256
                            i32.lt_u
                            br_if 1 (;@11;)
                            local.get 6
                            call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$18unlink_large_chunk17hfe5616337bd1c763E
                            br 2 (;@10;)
                          end
                          local.get 1
                          call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
                          local.set 5
                          local.get 4
                          i32.const 256
                          i32.lt_u
                          br_if 8 (;@3;)
                          block  ;; label = @12
                            local.get 5
                            local.get 4
                            i32.const 4
                            i32.add
                            i32.lt_u
                            br_if 0 (;@12;)
                            local.get 5
                            local.get 4
                            i32.sub
                            i32.const 131073
                            i32.lt_u
                            br_if 5 (;@7;)
                          end
                          i32.const 1052780
                          local.get 1
                          local.get 1
                          i32.load
                          local.tee 6
                          i32.sub
                          local.get 5
                          local.get 6
                          i32.add
                          i32.const 16
                          i32.add
                          local.tee 7
                          local.get 4
                          i32.const 31
                          i32.add
                          i32.const 1052780
                          call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$9page_size17h4275ce081e145962E
                          call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                          local.tee 5
                          i32.const 1
                          call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$5remap17he91884cce628dfabE
                          local.tee 4
                          i32.eqz
                          br_if 8 (;@3;)
                          local.get 4
                          local.get 6
                          i32.add
                          local.tee 1
                          local.get 5
                          local.get 6
                          i32.sub
                          local.tee 3
                          i32.const -16
                          i32.add
                          local.tee 2
                          i32.store offset=4
                          call $_ZN8dlmalloc8dlmalloc5Chunk14fencepost_head17h36c185cc5c557ae9E
                          local.set 0
                          local.get 1
                          local.get 2
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          local.get 0
                          i32.store offset=4
                          local.get 1
                          local.get 3
                          i32.const -12
                          i32.add
                          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                          i32.const 0
                          i32.store offset=4
                          i32.const 0
                          i32.const 0
                          i32.load offset=1053212
                          local.get 5
                          local.get 7
                          i32.sub
                          i32.add
                          local.tee 3
                          i32.store offset=1053212
                          i32.const 0
                          i32.const 0
                          i32.load offset=1053224
                          local.tee 2
                          local.get 4
                          local.get 4
                          local.get 2
                          i32.gt_u
                          select
                          i32.store offset=1053224
                          i32.const 0
                          i32.const 0
                          i32.load offset=1053216
                          local.tee 2
                          local.get 3
                          local.get 2
                          local.get 3
                          i32.gt_u
                          select
                          i32.store offset=1053216
                          br 10 (;@1;)
                        end
                        block  ;; label = @11
                          local.get 6
                          i32.const 12
                          i32.add
                          i32.load
                          local.tee 9
                          local.get 6
                          i32.const 8
                          i32.add
                          i32.load
                          local.tee 6
                          i32.eq
                          br_if 0 (;@11;)
                          local.get 6
                          local.get 9
                          i32.store offset=12
                          local.get 9
                          local.get 6
                          i32.store offset=8
                          br 1 (;@10;)
                        end
                        i32.const 0
                        i32.const 0
                        i32.load offset=1053188
                        i32.const -2
                        local.get 7
                        i32.const 3
                        i32.shr_u
                        i32.rotl
                        i32.and
                        i32.store offset=1053188
                      end
                      block  ;; label = @10
                        local.get 8
                        i32.const 16
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        i32.lt_u
                        br_if 0 (;@10;)
                        local.get 1
                        local.get 4
                        call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                        local.set 5
                        local.get 1
                        local.get 4
                        call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                        local.get 5
                        local.get 8
                        call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                        local.get 5
                        local.get 8
                        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$13dispose_chunk17h1640b0255174d80bE
                        local.get 1
                        br_if 9 (;@1;)
                        br 7 (;@3;)
                      end
                      local.get 1
                      local.get 5
                      call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                      local.get 1
                      br_if 8 (;@1;)
                      br 6 (;@3;)
                    end
                    i32.const 0
                    i32.load offset=1053196
                    local.get 5
                    i32.add
                    local.tee 5
                    local.get 4
                    i32.lt_u
                    br_if 5 (;@3;)
                    block  ;; label = @9
                      block  ;; label = @10
                        local.get 5
                        local.get 4
                        i32.sub
                        local.tee 6
                        i32.const 16
                        i32.const 8
                        call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                        i32.ge_u
                        br_if 0 (;@10;)
                        local.get 1
                        local.get 5
                        call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                        i32.const 0
                        local.set 6
                        i32.const 0
                        local.set 5
                        br 1 (;@9;)
                      end
                      local.get 1
                      local.get 4
                      call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                      local.tee 5
                      local.get 6
                      call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                      local.set 7
                      local.get 1
                      local.get 4
                      call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                      local.get 5
                      local.get 6
                      call $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E
                      local.get 7
                      call $_ZN8dlmalloc8dlmalloc5Chunk12clear_pinuse17hc5a5e247a89f23afE
                    end
                    i32.const 0
                    local.get 5
                    i32.store offset=1053204
                    i32.const 0
                    local.get 6
                    i32.store offset=1053196
                    local.get 1
                    br_if 7 (;@1;)
                    br 5 (;@3;)
                  end
                  local.get 5
                  local.get 4
                  i32.sub
                  local.tee 5
                  i32.const 16
                  i32.const 8
                  call $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE
                  i32.lt_u
                  br_if 0 (;@7;)
                  local.get 1
                  local.get 4
                  call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
                  local.set 6
                  local.get 1
                  local.get 4
                  call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                  local.get 6
                  local.get 5
                  call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
                  local.get 6
                  local.get 5
                  call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$13dispose_chunk17h1640b0255174d80bE
                end
                local.get 1
                br_if 5 (;@1;)
                br 3 (;@3;)
              end
              i32.const 0
              i32.load offset=1053200
              local.get 5
              i32.add
              local.tee 5
              local.get 4
              i32.gt_u
              br_if 1 (;@4;)
              br 2 (;@3;)
            end
            local.get 2
            local.get 0
            local.get 1
            local.get 3
            local.get 1
            local.get 3
            i32.lt_u
            select
            call $memcpy
            drop
            local.get 0
            call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$4free17ha0e864b0bef7e6efE
            br 2 (;@2;)
          end
          local.get 1
          local.get 4
          call $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E
          local.set 6
          local.get 1
          local.get 4
          call $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE
          local.get 6
          local.get 5
          local.get 4
          i32.sub
          local.tee 4
          i32.const 1
          i32.or
          i32.store offset=4
          i32.const 0
          local.get 4
          i32.store offset=1053200
          i32.const 0
          local.get 6
          i32.store offset=1053208
          local.get 1
          br_if 2 (;@1;)
        end
        local.get 3
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$6malloc17h0bf488847bb20491E
        local.tee 4
        i32.eqz
        br_if 0 (;@2;)
        local.get 4
        local.get 0
        local.get 1
        call $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE
        i32.const -8
        i32.const -4
        local.get 1
        call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
        select
        i32.add
        local.tee 2
        local.get 3
        local.get 2
        local.get 3
        i32.lt_u
        select
        call $memcpy
        local.set 3
        local.get 0
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$4free17ha0e864b0bef7e6efE
        local.get 3
        return
      end
      local.get 2
      return
    end
    local.get 1
    call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
    drop
    local.get 1
    call $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E)
  (func $__rdl_alloc_zeroed (type 2) (param i32 i32) (result i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.const 9
        i32.lt_u
        br_if 0 (;@2;)
        local.get 1
        local.get 0
        call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$8memalign17h5a4b58422e067547E
        local.set 1
        br 1 (;@1;)
      end
      local.get 0
      call $_ZN8dlmalloc8dlmalloc17Dlmalloc$LT$A$GT$6malloc17h0bf488847bb20491E
      local.set 1
    end
    block  ;; label = @1
      local.get 1
      i32.eqz
      br_if 0 (;@1;)
      block  ;; label = @2
        i32.const 1052780
        call $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$15allocates_zeros17h22d14f8545208ddfE
        i32.eqz
        br_if 0 (;@2;)
        local.get 1
        call $_ZN8dlmalloc8dlmalloc5Chunk8from_mem17h50bd2ce5234141e6E
        call $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E
        br_if 1 (;@1;)
      end
      local.get 1
      i32.const 0
      local.get 0
      call $memset
      drop
    end
    local.get 1)
  (func $rust_begin_unwind (type 3) (param i32)
    (local i32 i32 i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 1
    global.set $__stack_pointer
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        call $_ZN4core5panic10panic_info9PanicInfo8location17he81fea1bebe4ca73E
        local.tee 2
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        call $_ZN4core5panic10panic_info9PanicInfo7message17h5320e6c2c0b4337cE
        local.tee 3
        i32.eqz
        br_if 1 (;@1;)
        local.get 1
        local.get 2
        i32.store offset=8
        local.get 1
        local.get 0
        i32.store offset=4
        local.get 1
        local.get 3
        i32.store
        local.get 1
        call $_ZN3std10sys_common9backtrace26__rust_end_short_backtrace17hae3977477626e3caE
        unreachable
      end
      i32.const 1049044
      i32.const 43
      i32.const 1049208
      call $_ZN4core9panicking5panic17heed2792a4659ea4dE
      unreachable
    end
    i32.const 1049044
    i32.const 43
    i32.const 1049224
    call $_ZN4core9panicking5panic17heed2792a4659ea4dE
    unreachable)
  (func $_ZN90_$LT$std..panicking..begin_panic_handler..PanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$8take_box17h7f0e9beddbf9851aE (type 0) (param i32 i32)
    (local i32 i32 i32 i32 i64)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    local.get 1
    i32.const 4
    i32.add
    local.set 3
    block  ;; label = @1
      local.get 1
      i32.load offset=4
      br_if 0 (;@1;)
      local.get 1
      i32.load
      local.set 4
      local.get 2
      i32.const 32
      i32.add
      i32.const 8
      i32.add
      local.tee 5
      i32.const 0
      i32.store
      local.get 2
      i64.const 1
      i64.store offset=32
      local.get 2
      local.get 2
      i32.const 32
      i32.add
      i32.store offset=44
      local.get 2
      i32.const 44
      i32.add
      i32.const 1049020
      local.get 4
      call $_ZN4core3fmt5write17hcc90208b612ee6d9E
      drop
      local.get 2
      i32.const 16
      i32.add
      i32.const 8
      i32.add
      local.get 5
      i32.load
      local.tee 4
      i32.store
      local.get 2
      local.get 2
      i64.load offset=32
      local.tee 6
      i64.store offset=16
      local.get 3
      i32.const 8
      i32.add
      local.get 4
      i32.store
      local.get 3
      local.get 6
      i64.store align=4
    end
    local.get 2
    i32.const 8
    i32.add
    local.tee 4
    local.get 3
    i32.const 8
    i32.add
    i32.load
    i32.store
    local.get 1
    i32.const 12
    i32.add
    i32.const 0
    i32.store
    local.get 3
    i64.load align=4
    local.set 6
    local.get 1
    i64.const 1
    i64.store offset=4 align=4
    i32.const 0
    i32.load8_u offset=1052753
    drop
    local.get 2
    local.get 6
    i64.store
    block  ;; label = @1
      i32.const 12
      i32.const 4
      call $__rust_alloc
      local.tee 1
      br_if 0 (;@1;)
      i32.const 4
      i32.const 12
      call $_ZN5alloc5alloc18handle_alloc_error17hda4b1b4e18f53a00E
      unreachable
    end
    local.get 1
    local.get 2
    i64.load
    i64.store align=4
    local.get 1
    i32.const 8
    i32.add
    local.get 4
    i32.load
    i32.store
    local.get 0
    i32.const 1049240
    i32.store offset=4
    local.get 0
    local.get 1
    i32.store
    local.get 2
    i32.const 48
    i32.add
    global.set $__stack_pointer)
  (func $_ZN90_$LT$std..panicking..begin_panic_handler..PanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$3get17hb74c4b52802455cfE (type 0) (param i32 i32)
    (local i32 i32 i32 i64)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    local.get 1
    i32.const 4
    i32.add
    local.set 3
    block  ;; label = @1
      local.get 1
      i32.load offset=4
      br_if 0 (;@1;)
      local.get 1
      i32.load
      local.set 1
      local.get 2
      i32.const 16
      i32.add
      i32.const 8
      i32.add
      local.tee 4
      i32.const 0
      i32.store
      local.get 2
      i64.const 1
      i64.store offset=16
      local.get 2
      local.get 2
      i32.const 16
      i32.add
      i32.store offset=28
      local.get 2
      i32.const 28
      i32.add
      i32.const 1049020
      local.get 1
      call $_ZN4core3fmt5write17hcc90208b612ee6d9E
      drop
      local.get 2
      i32.const 8
      i32.add
      local.get 4
      i32.load
      local.tee 1
      i32.store
      local.get 2
      local.get 2
      i64.load offset=16
      local.tee 5
      i64.store
      local.get 3
      i32.const 8
      i32.add
      local.get 1
      i32.store
      local.get 3
      local.get 5
      i64.store align=4
    end
    local.get 0
    i32.const 1049240
    i32.store offset=4
    local.get 0
    local.get 3
    i32.store
    local.get 2
    i32.const 32
    i32.add
    global.set $__stack_pointer)
  (func $_ZN93_$LT$std..panicking..begin_panic_handler..StrPanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$8take_box17ha7fd4a6b92995084E (type 0) (param i32 i32)
    (local i32 i32)
    i32.const 0
    i32.load8_u offset=1052753
    drop
    local.get 1
    i32.load offset=4
    local.set 2
    local.get 1
    i32.load
    local.set 3
    block  ;; label = @1
      i32.const 8
      i32.const 4
      call $__rust_alloc
      local.tee 1
      br_if 0 (;@1;)
      i32.const 4
      i32.const 8
      call $_ZN5alloc5alloc18handle_alloc_error17hda4b1b4e18f53a00E
      unreachable
    end
    local.get 1
    local.get 2
    i32.store offset=4
    local.get 1
    local.get 3
    i32.store
    local.get 0
    i32.const 1049256
    i32.store offset=4
    local.get 0
    local.get 1
    i32.store)
  (func $_ZN93_$LT$std..panicking..begin_panic_handler..StrPanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$3get17h6e5fb3beae42e74eE (type 0) (param i32 i32)
    local.get 0
    i32.const 1049256
    i32.store offset=4
    local.get 0
    local.get 1
    i32.store)
  (func $_ZN3std9panicking20rust_panic_with_hook17h80ff9e1005fd6704E (type 9) (param i32 i32 i32 i32 i32)
    (local i32 i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 5
    global.set $__stack_pointer
    i32.const 0
    i32.const 0
    i32.load offset=1052776
    local.tee 6
    i32.const 1
    i32.add
    i32.store offset=1052776
    block  ;; label = @1
      block  ;; label = @2
        local.get 6
        i32.const 0
        i32.lt_s
        br_if 0 (;@2;)
        i32.const 0
        i32.load8_u offset=1053236
        i32.const 255
        i32.and
        br_if 0 (;@2;)
        i32.const 0
        i32.const 1
        i32.store8 offset=1053236
        i32.const 0
        i32.const 0
        i32.load offset=1053232
        i32.const 1
        i32.add
        i32.store offset=1053232
        local.get 5
        local.get 2
        i32.store offset=20
        local.get 5
        i32.const 1049312
        i32.store offset=12
        local.get 5
        i32.const 1049044
        i32.store offset=8
        local.get 5
        local.get 4
        i32.store8 offset=24
        local.get 5
        local.get 3
        i32.store offset=16
        i32.const 0
        i32.load offset=1052760
        local.tee 6
        i32.const -1
        i32.le_s
        br_if 0 (;@2;)
        i32.const 0
        local.get 6
        i32.const 1
        i32.add
        i32.store offset=1052760
        block  ;; label = @3
          i32.const 0
          i32.load offset=1052768
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          local.get 0
          local.get 1
          i32.load offset=16
          call_indirect (type 0)
          local.get 5
          local.get 5
          i64.load
          i64.store offset=8
          i32.const 0
          i32.load offset=1052768
          local.get 5
          i32.const 8
          i32.add
          i32.const 0
          i32.load offset=1052772
          i32.load offset=20
          call_indirect (type 0)
          i32.const 0
          i32.load offset=1052760
          i32.const -1
          i32.add
          local.set 6
        end
        i32.const 0
        local.get 6
        i32.store offset=1052760
        i32.const 0
        i32.const 0
        i32.store8 offset=1053236
        local.get 4
        br_if 1 (;@1;)
      end
      unreachable
      unreachable
    end
    local.get 0
    local.get 1
    call $rust_panic
    unreachable)
  (func $rust_panic (type 0) (param i32 i32)
    local.get 0
    local.get 1
    call $__rust_start_panic
    drop
    unreachable
    unreachable)
  (func $__rg_oom (type 0) (param i32 i32)
    (local i32)
    local.get 1
    local.get 0
    i32.const 0
    i32.load offset=1052756
    local.tee 2
    i32.const 3
    local.get 2
    select
    call_indirect (type 0)
    unreachable
    unreachable)
  (func $__rust_start_panic (type 2) (param i32 i32) (result i32)
    unreachable
    unreachable)
  (func $_ZN8dlmalloc8dlmalloc8align_up17h8e13aabed3f1b49aE (type 2) (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add
    i32.const -1
    i32.add
    i32.const 0
    local.get 1
    i32.sub
    i32.and)
  (func $_ZN8dlmalloc8dlmalloc9left_bits17h2d3907410afd11a6E (type 7) (param i32) (result i32)
    local.get 0
    i32.const 1
    i32.shl
    local.tee 0
    i32.const 0
    local.get 0
    i32.sub
    i32.or)
  (func $_ZN8dlmalloc8dlmalloc9least_bit17h8529bd9531fdaa56E (type 7) (param i32) (result i32)
    i32.const 0
    local.get 0
    i32.sub
    local.get 0
    i32.and)
  (func $_ZN8dlmalloc8dlmalloc24leftshift_for_tree_index17heba1df7d748a2df6E (type 7) (param i32) (result i32)
    i32.const 0
    i32.const 25
    local.get 0
    i32.const 1
    i32.shr_u
    i32.sub
    local.get 0
    i32.const 31
    i32.eq
    select)
  (func $_ZN8dlmalloc8dlmalloc5Chunk14fencepost_head17h36c185cc5c557ae9E (type 10) (result i32)
    i32.const 7)
  (func $_ZN8dlmalloc8dlmalloc5Chunk4size17h2fd9a0c6f53cdc5fE (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=4
    i32.const -8
    i32.and)
  (func $_ZN8dlmalloc8dlmalloc5Chunk6cinuse17hda8b659400f2c355E (type 7) (param i32) (result i32)
    local.get 0
    i32.load8_u offset=4
    i32.const 2
    i32.and
    i32.const 1
    i32.shr_u)
  (func $_ZN8dlmalloc8dlmalloc5Chunk6pinuse17h0679ab521de26961E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=4
    i32.const 1
    i32.and)
  (func $_ZN8dlmalloc8dlmalloc5Chunk12clear_pinuse17hc5a5e247a89f23afE (type 3) (param i32)
    local.get 0
    local.get 0
    i32.load offset=4
    i32.const -2
    i32.and
    i32.store offset=4)
  (func $_ZN8dlmalloc8dlmalloc5Chunk5inuse17hd8149ac8e52a6556E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=4
    i32.const 3
    i32.and
    i32.const 1
    i32.ne)
  (func $_ZN8dlmalloc8dlmalloc5Chunk7mmapped17h344ebcf784805636E (type 7) (param i32) (result i32)
    local.get 0
    i32.load8_u offset=4
    i32.const 3
    i32.and
    i32.eqz)
  (func $_ZN8dlmalloc8dlmalloc5Chunk9set_inuse17h02ef63f1ede70f0fE (type 0) (param i32 i32)
    local.get 0
    local.get 0
    i32.load offset=4
    i32.const 1
    i32.and
    local.get 1
    i32.or
    i32.const 2
    i32.or
    i32.store offset=4
    local.get 0
    local.get 1
    i32.add
    local.tee 0
    local.get 0
    i32.load offset=4
    i32.const 1
    i32.or
    i32.store offset=4)
  (func $_ZN8dlmalloc8dlmalloc5Chunk20set_inuse_and_pinuse17hbb34d80e5dc7393cE (type 0) (param i32 i32)
    local.get 0
    local.get 1
    i32.const 3
    i32.or
    i32.store offset=4
    local.get 0
    local.get 1
    i32.add
    local.tee 1
    local.get 1
    i32.load offset=4
    i32.const 1
    i32.or
    i32.store offset=4)
  (func $_ZN8dlmalloc8dlmalloc5Chunk34set_size_and_pinuse_of_inuse_chunk17h32790348760d6bc0E (type 0) (param i32 i32)
    local.get 0
    local.get 1
    i32.const 3
    i32.or
    i32.store offset=4)
  (func $_ZN8dlmalloc8dlmalloc5Chunk33set_size_and_pinuse_of_free_chunk17h7e37ddcda73a1e13E (type 0) (param i32 i32)
    local.get 0
    local.get 1
    i32.const 1
    i32.or
    i32.store offset=4
    local.get 0
    local.get 1
    i32.add
    local.get 1
    i32.store)
  (func $_ZN8dlmalloc8dlmalloc5Chunk20set_free_with_pinuse17h886584b8dbe82720E (type 4) (param i32 i32 i32)
    local.get 2
    local.get 2
    i32.load offset=4
    i32.const -2
    i32.and
    i32.store offset=4
    local.get 0
    local.get 1
    i32.const 1
    i32.or
    i32.store offset=4
    local.get 0
    local.get 1
    i32.add
    local.get 1
    i32.store)
  (func $_ZN8dlmalloc8dlmalloc5Chunk11plus_offset17h355a9398bda06360E (type 2) (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add)
  (func $_ZN8dlmalloc8dlmalloc5Chunk12minus_offset17h02a4b3658a047a83E (type 2) (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.sub)
  (func $_ZN8dlmalloc8dlmalloc5Chunk6to_mem17h72dbe38b15e02888E (type 7) (param i32) (result i32)
    local.get 0
    i32.const 8
    i32.add)
  (func $_ZN8dlmalloc8dlmalloc5Chunk10mem_offset17h8129542585fb206fE (type 10) (result i32)
    i32.const 8)
  (func $_ZN8dlmalloc8dlmalloc5Chunk8from_mem17h50bd2ce5234141e6E (type 7) (param i32) (result i32)
    local.get 0
    i32.const -8
    i32.add)
  (func $_ZN8dlmalloc8dlmalloc9TreeChunk14leftmost_child17h1874651cab23213fE (type 7) (param i32) (result i32)
    (local i32)
    block  ;; label = @1
      local.get 0
      i32.load offset=16
      local.tee 1
      br_if 0 (;@1;)
      local.get 0
      i32.const 20
      i32.add
      i32.load
      local.set 1
    end
    local.get 1)
  (func $_ZN8dlmalloc8dlmalloc9TreeChunk5chunk17h279d111a8fb475acE (type 7) (param i32) (result i32)
    local.get 0)
  (func $_ZN8dlmalloc8dlmalloc9TreeChunk4next17hd6b4dfb4c6a80285E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=12)
  (func $_ZN8dlmalloc8dlmalloc9TreeChunk4prev17h1d513924dc250de7E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=8)
  (func $_ZN8dlmalloc8dlmalloc7Segment9is_extern17had4bf3a4166f12c9E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=12
    i32.const 1
    i32.and)
  (func $_ZN8dlmalloc8dlmalloc7Segment9sys_flags17h1d629ada7a9c5547E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=12
    i32.const 1
    i32.shr_u)
  (func $_ZN8dlmalloc8dlmalloc7Segment5holds17h19d235ec9132c568E (type 2) (param i32 i32) (result i32)
    (local i32 i32)
    i32.const 0
    local.set 2
    block  ;; label = @1
      local.get 0
      i32.load
      local.tee 3
      local.get 1
      i32.gt_u
      br_if 0 (;@1;)
      local.get 3
      local.get 0
      i32.load offset=4
      i32.add
      local.get 1
      i32.gt_u
      local.set 2
    end
    local.get 2)
  (func $_ZN8dlmalloc8dlmalloc7Segment3top17h3564c5eabf6b59cfE (type 7) (param i32) (result i32)
    local.get 0
    i32.load
    local.get 0
    i32.load offset=4
    i32.add)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$5alloc17h67c1aeecb07d49a8E (type 4) (param i32 i32 i32)
    (local i32)
    local.get 2
    i32.const 16
    i32.shr_u
    memory.grow
    local.set 3
    local.get 0
    i32.const 0
    i32.store offset=8
    local.get 0
    i32.const 0
    local.get 2
    i32.const -65536
    i32.and
    local.get 3
    i32.const -1
    i32.eq
    local.tee 2
    select
    i32.store offset=4
    local.get 0
    i32.const 0
    local.get 3
    i32.const 16
    i32.shl
    local.get 2
    select
    i32.store)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$5remap17he91884cce628dfabE (type 11) (param i32 i32 i32 i32 i32) (result i32)
    i32.const 0)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$9free_part17h70a0659286725f16E (type 5) (param i32 i32 i32 i32) (result i32)
    i32.const 0)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$4free17ha2e3d76ae283f292E (type 1) (param i32 i32 i32) (result i32)
    i32.const 0)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$16can_release_part17h27973575abb48cb2E (type 2) (param i32 i32) (result i32)
    i32.const 0)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$15allocates_zeros17h22d14f8545208ddfE (type 7) (param i32) (result i32)
    i32.const 1)
  (func $_ZN61_$LT$dlmalloc..sys..System$u20$as$u20$dlmalloc..Allocator$GT$9page_size17h4275ce081e145962E (type 7) (param i32) (result i32)
    i32.const 65536)
  (func $_ZN5alloc5alloc18handle_alloc_error17hda4b1b4e18f53a00E (type 0) (param i32 i32)
    local.get 0
    local.get 1
    call $_ZN5alloc5alloc18handle_alloc_error8rt_error17hb33b51e6ff2dbda8E
    unreachable)
  (func $_ZN5alloc7raw_vec17capacity_overflow17h9db66c34eec3373bE (type 8)
    (local i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 0
    global.set $__stack_pointer
    local.get 0
    i32.const 20
    i32.add
    i64.const 0
    i64.store align=4
    local.get 0
    i32.const 1
    i32.store offset=12
    local.get 0
    i32.const 1049376
    i32.store offset=8
    local.get 0
    i32.const 1049328
    i32.store offset=16
    local.get 0
    i32.const 8
    i32.add
    i32.const 1049384
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN5alloc5alloc18handle_alloc_error8rt_error17hb33b51e6ff2dbda8E (type 0) (param i32 i32)
    local.get 1
    local.get 0
    call $__rust_alloc_error_handler
    unreachable)
  (func $_ZN4core3ops8function6FnOnce9call_once17h03cd4205c3ed02abE (type 2) (param i32 i32) (result i32)
    local.get 0
    i32.load
    drop
    loop (result i32)  ;; label = @1
      br 0 (;@1;)
    end)
  (func $_ZN4core3ptr37drop_in_place$LT$core..fmt..Error$GT$17hdb2ce4668b5ca4d5E (type 3) (param i32))
  (func $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE (type 0) (param i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    local.get 2
    local.get 0
    i32.store offset=20
    local.get 2
    i32.const 1049480
    i32.store offset=12
    local.get 2
    i32.const 1049400
    i32.store offset=8
    local.get 2
    i32.const 1
    i32.store8 offset=24
    local.get 2
    local.get 1
    i32.store offset=16
    local.get 2
    i32.const 8
    i32.add
    call $rust_begin_unwind
    unreachable)
  (func $_ZN4core9panicking18panic_bounds_check17h113d0e7204064fb4E (type 4) (param i32 i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    local.get 3
    local.get 1
    i32.store offset=4
    local.get 3
    local.get 0
    i32.store
    local.get 3
    i32.const 8
    i32.add
    i32.const 12
    i32.add
    i64.const 2
    i64.store align=4
    local.get 3
    i32.const 32
    i32.add
    i32.const 12
    i32.add
    i32.const 2
    i32.store
    local.get 3
    i32.const 2
    i32.store offset=12
    local.get 3
    i32.const 1049548
    i32.store offset=8
    local.get 3
    i32.const 2
    i32.store offset=36
    local.get 3
    local.get 3
    i32.const 32
    i32.add
    i32.store offset=16
    local.get 3
    local.get 3
    i32.store offset=40
    local.get 3
    local.get 3
    i32.const 4
    i32.add
    i32.store offset=32
    local.get 3
    i32.const 8
    i32.add
    local.get 2
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN4core5slice5index26slice_start_index_len_fail17hf84a6cbd5b9bf444E (type 4) (param i32 i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store
    local.get 3
    local.get 1
    i32.store offset=4
    local.get 3
    i32.const 8
    i32.add
    i32.const 12
    i32.add
    i64.const 2
    i64.store align=4
    local.get 3
    i32.const 32
    i32.add
    i32.const 12
    i32.add
    i32.const 2
    i32.store
    local.get 3
    i32.const 2
    i32.store offset=12
    local.get 3
    i32.const 1049896
    i32.store offset=8
    local.get 3
    i32.const 2
    i32.store offset=36
    local.get 3
    local.get 3
    i32.const 32
    i32.add
    i32.store offset=16
    local.get 3
    local.get 3
    i32.const 4
    i32.add
    i32.store offset=40
    local.get 3
    local.get 3
    i32.store offset=32
    local.get 3
    i32.const 8
    i32.add
    local.get 2
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN4core5slice5index24slice_end_index_len_fail17hcd7f8e8288c8efc1E (type 4) (param i32 i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store
    local.get 3
    local.get 1
    i32.store offset=4
    local.get 3
    i32.const 8
    i32.add
    i32.const 12
    i32.add
    i64.const 2
    i64.store align=4
    local.get 3
    i32.const 32
    i32.add
    i32.const 12
    i32.add
    i32.const 2
    i32.store
    local.get 3
    i32.const 2
    i32.store offset=12
    local.get 3
    i32.const 1049928
    i32.store offset=8
    local.get 3
    i32.const 2
    i32.store offset=36
    local.get 3
    local.get 3
    i32.const 32
    i32.add
    i32.store offset=16
    local.get 3
    local.get 3
    i32.const 4
    i32.add
    i32.store offset=40
    local.get 3
    local.get 3
    i32.store offset=32
    local.get 3
    i32.const 8
    i32.add
    local.get 2
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN4core3fmt9Formatter3pad17h2cda20b35f9c0236E (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i32.load
        local.tee 3
        local.get 0
        i32.load offset=8
        local.tee 4
        i32.or
        i32.eqz
        br_if 0 (;@2;)
        block  ;; label = @3
          local.get 4
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          local.get 2
          i32.add
          local.set 5
          local.get 0
          i32.const 12
          i32.add
          i32.load
          i32.const 1
          i32.add
          local.set 6
          i32.const 0
          local.set 7
          local.get 1
          local.set 8
          block  ;; label = @4
            loop  ;; label = @5
              local.get 8
              local.set 4
              local.get 6
              i32.const -1
              i32.add
              local.tee 6
              i32.eqz
              br_if 1 (;@4;)
              local.get 4
              local.get 5
              i32.eq
              br_if 2 (;@3;)
              block  ;; label = @6
                block  ;; label = @7
                  local.get 4
                  i32.load8_s
                  local.tee 9
                  i32.const -1
                  i32.le_s
                  br_if 0 (;@7;)
                  local.get 4
                  i32.const 1
                  i32.add
                  local.set 8
                  local.get 9
                  i32.const 255
                  i32.and
                  local.set 9
                  br 1 (;@6;)
                end
                local.get 4
                i32.load8_u offset=1
                i32.const 63
                i32.and
                local.set 10
                local.get 9
                i32.const 31
                i32.and
                local.set 8
                block  ;; label = @7
                  local.get 9
                  i32.const -33
                  i32.gt_u
                  br_if 0 (;@7;)
                  local.get 8
                  i32.const 6
                  i32.shl
                  local.get 10
                  i32.or
                  local.set 9
                  local.get 4
                  i32.const 2
                  i32.add
                  local.set 8
                  br 1 (;@6;)
                end
                local.get 10
                i32.const 6
                i32.shl
                local.get 4
                i32.load8_u offset=2
                i32.const 63
                i32.and
                i32.or
                local.set 10
                block  ;; label = @7
                  local.get 9
                  i32.const -16
                  i32.ge_u
                  br_if 0 (;@7;)
                  local.get 10
                  local.get 8
                  i32.const 12
                  i32.shl
                  i32.or
                  local.set 9
                  local.get 4
                  i32.const 3
                  i32.add
                  local.set 8
                  br 1 (;@6;)
                end
                local.get 10
                i32.const 6
                i32.shl
                local.get 4
                i32.load8_u offset=3
                i32.const 63
                i32.and
                i32.or
                local.get 8
                i32.const 18
                i32.shl
                i32.const 1835008
                i32.and
                i32.or
                local.tee 9
                i32.const 1114112
                i32.eq
                br_if 3 (;@3;)
                local.get 4
                i32.const 4
                i32.add
                local.set 8
              end
              local.get 7
              local.get 4
              i32.sub
              local.get 8
              i32.add
              local.set 7
              local.get 9
              i32.const 1114112
              i32.ne
              br_if 0 (;@5;)
              br 2 (;@3;)
            end
          end
          local.get 4
          local.get 5
          i32.eq
          br_if 0 (;@3;)
          block  ;; label = @4
            local.get 4
            i32.load8_s
            local.tee 8
            i32.const -1
            i32.gt_s
            br_if 0 (;@4;)
            local.get 8
            i32.const -32
            i32.lt_u
            br_if 0 (;@4;)
            local.get 8
            i32.const -16
            i32.lt_u
            br_if 0 (;@4;)
            local.get 4
            i32.load8_u offset=2
            i32.const 63
            i32.and
            i32.const 6
            i32.shl
            local.get 4
            i32.load8_u offset=1
            i32.const 63
            i32.and
            i32.const 12
            i32.shl
            i32.or
            local.get 4
            i32.load8_u offset=3
            i32.const 63
            i32.and
            i32.or
            local.get 8
            i32.const 255
            i32.and
            i32.const 18
            i32.shl
            i32.const 1835008
            i32.and
            i32.or
            i32.const 1114112
            i32.eq
            br_if 1 (;@3;)
          end
          block  ;; label = @4
            block  ;; label = @5
              local.get 7
              i32.eqz
              br_if 0 (;@5;)
              block  ;; label = @6
                local.get 7
                local.get 2
                i32.lt_u
                br_if 0 (;@6;)
                i32.const 0
                local.set 4
                local.get 7
                local.get 2
                i32.eq
                br_if 1 (;@5;)
                br 2 (;@4;)
              end
              i32.const 0
              local.set 4
              local.get 1
              local.get 7
              i32.add
              i32.load8_s
              i32.const -64
              i32.lt_s
              br_if 1 (;@4;)
            end
            local.get 1
            local.set 4
          end
          local.get 7
          local.get 2
          local.get 4
          select
          local.set 2
          local.get 4
          local.get 1
          local.get 4
          select
          local.set 1
        end
        block  ;; label = @3
          local.get 3
          br_if 0 (;@3;)
          local.get 0
          i32.load offset=20
          local.get 1
          local.get 2
          local.get 0
          i32.const 24
          i32.add
          i32.load
          i32.load offset=12
          call_indirect (type 1)
          return
        end
        local.get 0
        i32.load offset=4
        local.set 5
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            i32.const 16
            i32.lt_u
            br_if 0 (;@4;)
            local.get 1
            local.get 2
            call $_ZN4core3str5count14do_count_chars17ha8caff7fcf946f42E
            local.set 4
            br 1 (;@3;)
          end
          block  ;; label = @4
            local.get 2
            br_if 0 (;@4;)
            i32.const 0
            local.set 4
            br 1 (;@3;)
          end
          local.get 2
          i32.const 3
          i32.and
          local.set 6
          block  ;; label = @4
            block  ;; label = @5
              local.get 2
              i32.const 4
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              local.set 4
              i32.const 0
              local.set 9
              br 1 (;@4;)
            end
            local.get 2
            i32.const -4
            i32.and
            local.set 7
            i32.const 0
            local.set 4
            i32.const 0
            local.set 9
            loop  ;; label = @5
              local.get 4
              local.get 1
              local.get 9
              i32.add
              local.tee 8
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.get 8
              i32.const 1
              i32.add
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.get 8
              i32.const 2
              i32.add
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.get 8
              i32.const 3
              i32.add
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.set 4
              local.get 7
              local.get 9
              i32.const 4
              i32.add
              local.tee 9
              i32.ne
              br_if 0 (;@5;)
            end
          end
          local.get 6
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          local.get 9
          i32.add
          local.set 8
          loop  ;; label = @4
            local.get 4
            local.get 8
            i32.load8_s
            i32.const -65
            i32.gt_s
            i32.add
            local.set 4
            local.get 8
            i32.const 1
            i32.add
            local.set 8
            local.get 6
            i32.const -1
            i32.add
            local.tee 6
            br_if 0 (;@4;)
          end
        end
        local.get 5
        local.get 4
        i32.le_u
        br_if 1 (;@1;)
        local.get 5
        local.get 4
        i32.sub
        local.set 7
        i32.const 0
        local.set 4
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.load8_u offset=32
              br_table 2 (;@3;) 0 (;@5;) 1 (;@4;) 2 (;@3;) 2 (;@3;)
            end
            local.get 7
            local.set 4
            i32.const 0
            local.set 7
            br 1 (;@3;)
          end
          local.get 7
          i32.const 1
          i32.shr_u
          local.set 4
          local.get 7
          i32.const 1
          i32.add
          i32.const 1
          i32.shr_u
          local.set 7
        end
        local.get 4
        i32.const 1
        i32.add
        local.set 4
        local.get 0
        i32.const 24
        i32.add
        i32.load
        local.set 9
        local.get 0
        i32.const 20
        i32.add
        i32.load
        local.set 6
        local.get 0
        i32.load offset=16
        local.set 8
        block  ;; label = @3
          loop  ;; label = @4
            local.get 4
            i32.const -1
            i32.add
            local.tee 4
            i32.eqz
            br_if 1 (;@3;)
            local.get 6
            local.get 8
            local.get 9
            i32.load offset=16
            call_indirect (type 2)
            i32.eqz
            br_if 0 (;@4;)
          end
          i32.const 1
          return
        end
        i32.const 1
        local.set 4
        block  ;; label = @3
          local.get 8
          i32.const 1114112
          i32.eq
          br_if 0 (;@3;)
          local.get 6
          local.get 1
          local.get 2
          local.get 9
          i32.load offset=12
          call_indirect (type 1)
          br_if 0 (;@3;)
          i32.const 0
          local.set 4
          block  ;; label = @4
            loop  ;; label = @5
              block  ;; label = @6
                local.get 7
                local.get 4
                i32.ne
                br_if 0 (;@6;)
                local.get 7
                local.set 4
                br 2 (;@4;)
              end
              local.get 4
              i32.const 1
              i32.add
              local.set 4
              local.get 6
              local.get 8
              local.get 9
              i32.load offset=16
              call_indirect (type 2)
              i32.eqz
              br_if 0 (;@5;)
            end
            local.get 4
            i32.const -1
            i32.add
            local.set 4
          end
          local.get 4
          local.get 7
          i32.lt_u
          local.set 4
        end
        local.get 4
        return
      end
      local.get 0
      i32.load offset=20
      local.get 1
      local.get 2
      local.get 0
      i32.const 24
      i32.add
      i32.load
      i32.load offset=12
      call_indirect (type 1)
      return
    end
    local.get 0
    i32.load offset=20
    local.get 1
    local.get 2
    local.get 0
    i32.const 24
    i32.add
    i32.load
    i32.load offset=12
    call_indirect (type 1))
  (func $_ZN4core9panicking5panic17heed2792a4659ea4dE (type 4) (param i32 i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    local.get 3
    i32.const 12
    i32.add
    i64.const 0
    i64.store align=4
    local.get 3
    i32.const 1
    i32.store offset=4
    local.get 3
    i32.const 1049400
    i32.store offset=8
    local.get 3
    local.get 1
    i32.store offset=28
    local.get 3
    local.get 0
    i32.store offset=24
    local.get 3
    local.get 3
    i32.const 24
    i32.add
    i32.store
    local.get 3
    local.get 2
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN4core5slice5index22slice_index_order_fail17h61bd70cc51de790bE (type 4) (param i32 i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    local.get 3
    local.get 0
    i32.store
    local.get 3
    local.get 1
    i32.store offset=4
    local.get 3
    i32.const 8
    i32.add
    i32.const 12
    i32.add
    i64.const 2
    i64.store align=4
    local.get 3
    i32.const 32
    i32.add
    i32.const 12
    i32.add
    i32.const 2
    i32.store
    local.get 3
    i32.const 2
    i32.store offset=12
    local.get 3
    i32.const 1049980
    i32.store offset=8
    local.get 3
    i32.const 2
    i32.store offset=36
    local.get 3
    local.get 3
    i32.const 32
    i32.add
    i32.store offset=16
    local.get 3
    local.get 3
    i32.const 4
    i32.add
    i32.store offset=40
    local.get 3
    local.get 3
    i32.store offset=32
    local.get 3
    i32.const 8
    i32.add
    local.get 2
    call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
    unreachable)
  (func $_ZN4core3fmt3num3imp52_$LT$impl$u20$core..fmt..Display$u20$for$u20$u32$GT$3fmt17h2b6c5f9cccdc9b6dE (type 2) (param i32 i32) (result i32)
    local.get 0
    i64.load32_u
    i32.const 1
    local.get 1
    call $_ZN4core3fmt3num3imp7fmt_u6417h01c3e5927f09eee1E)
  (func $_ZN4core3fmt3num50_$LT$impl$u20$core..fmt..Debug$u20$for$u20$u32$GT$3fmt17h755d20114b075bd4E (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32)
    global.get $__stack_pointer
    i32.const 128
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 1
              i32.load offset=28
              local.tee 3
              i32.const 16
              i32.and
              br_if 0 (;@5;)
              local.get 3
              i32.const 32
              i32.and
              br_if 1 (;@4;)
              local.get 0
              i64.load32_u
              i32.const 1
              local.get 1
              call $_ZN4core3fmt3num3imp7fmt_u6417h01c3e5927f09eee1E
              local.set 0
              br 2 (;@3;)
            end
            local.get 0
            i32.load
            local.set 0
            i32.const 0
            local.set 3
            loop  ;; label = @5
              local.get 2
              local.get 3
              i32.add
              i32.const 127
              i32.add
              i32.const 48
              i32.const 87
              local.get 0
              i32.const 15
              i32.and
              local.tee 4
              i32.const 10
              i32.lt_u
              select
              local.get 4
              i32.add
              i32.store8
              local.get 3
              i32.const -1
              i32.add
              local.set 3
              local.get 0
              i32.const 16
              i32.lt_u
              local.set 4
              local.get 0
              i32.const 4
              i32.shr_u
              local.set 0
              local.get 4
              i32.eqz
              br_if 0 (;@5;)
            end
            local.get 3
            i32.const 128
            i32.add
            local.tee 0
            i32.const 128
            i32.gt_u
            br_if 2 (;@2;)
            local.get 1
            i32.const 1
            i32.const 1049565
            i32.const 2
            local.get 2
            local.get 3
            i32.add
            i32.const 128
            i32.add
            i32.const 0
            local.get 3
            i32.sub
            call $_ZN4core3fmt9Formatter12pad_integral17h7f32912d39031beeE
            local.set 0
            br 1 (;@3;)
          end
          local.get 0
          i32.load
          local.set 0
          i32.const 0
          local.set 3
          loop  ;; label = @4
            local.get 2
            local.get 3
            i32.add
            i32.const 127
            i32.add
            i32.const 48
            i32.const 55
            local.get 0
            i32.const 15
            i32.and
            local.tee 4
            i32.const 10
            i32.lt_u
            select
            local.get 4
            i32.add
            i32.store8
            local.get 3
            i32.const -1
            i32.add
            local.set 3
            local.get 0
            i32.const 16
            i32.lt_u
            local.set 4
            local.get 0
            i32.const 4
            i32.shr_u
            local.set 0
            local.get 4
            i32.eqz
            br_if 0 (;@4;)
          end
          local.get 3
          i32.const 128
          i32.add
          local.tee 0
          i32.const 128
          i32.gt_u
          br_if 2 (;@1;)
          local.get 1
          i32.const 1
          i32.const 1049565
          i32.const 2
          local.get 2
          local.get 3
          i32.add
          i32.const 128
          i32.add
          i32.const 0
          local.get 3
          i32.sub
          call $_ZN4core3fmt9Formatter12pad_integral17h7f32912d39031beeE
          local.set 0
        end
        local.get 2
        i32.const 128
        i32.add
        global.set $__stack_pointer
        local.get 0
        return
      end
      local.get 0
      i32.const 128
      i32.const 1049596
      call $_ZN4core5slice5index26slice_start_index_len_fail17hf84a6cbd5b9bf444E
      unreachable
    end
    local.get 0
    i32.const 128
    i32.const 1049596
    call $_ZN4core5slice5index26slice_start_index_len_fail17hf84a6cbd5b9bf444E
    unreachable)
  (func $_ZN4core3fmt5write17hcc90208b612ee6d9E (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    local.get 3
    i32.const 32
    i32.add
    local.get 1
    i32.store
    local.get 3
    i32.const 3
    i32.store8 offset=40
    local.get 3
    i32.const 32
    i32.store offset=24
    i32.const 0
    local.set 4
    local.get 3
    i32.const 0
    i32.store offset=36
    local.get 3
    local.get 0
    i32.store offset=28
    local.get 3
    i32.const 0
    i32.store offset=16
    local.get 3
    i32.const 0
    i32.store offset=8
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            i32.load offset=16
            local.tee 5
            br_if 0 (;@4;)
            local.get 2
            i32.const 12
            i32.add
            i32.load
            local.tee 0
            i32.eqz
            br_if 1 (;@3;)
            local.get 2
            i32.load offset=8
            local.set 1
            local.get 0
            i32.const 3
            i32.shl
            local.set 6
            local.get 0
            i32.const -1
            i32.add
            i32.const 536870911
            i32.and
            i32.const 1
            i32.add
            local.set 4
            local.get 2
            i32.load
            local.set 0
            loop  ;; label = @5
              block  ;; label = @6
                local.get 0
                i32.const 4
                i32.add
                i32.load
                local.tee 7
                i32.eqz
                br_if 0 (;@6;)
                local.get 3
                i32.load offset=28
                local.get 0
                i32.load
                local.get 7
                local.get 3
                i32.load offset=32
                i32.load offset=12
                call_indirect (type 1)
                br_if 4 (;@2;)
              end
              local.get 1
              i32.load
              local.get 3
              i32.const 8
              i32.add
              local.get 1
              i32.const 4
              i32.add
              i32.load
              call_indirect (type 2)
              br_if 3 (;@2;)
              local.get 1
              i32.const 8
              i32.add
              local.set 1
              local.get 0
              i32.const 8
              i32.add
              local.set 0
              local.get 6
              i32.const -8
              i32.add
              local.tee 6
              br_if 0 (;@5;)
              br 2 (;@3;)
            end
          end
          local.get 2
          i32.const 20
          i32.add
          i32.load
          local.tee 1
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          i32.const 5
          i32.shl
          local.set 8
          local.get 1
          i32.const -1
          i32.add
          i32.const 134217727
          i32.and
          i32.const 1
          i32.add
          local.set 4
          local.get 2
          i32.load offset=8
          local.set 9
          local.get 2
          i32.load
          local.set 0
          i32.const 0
          local.set 6
          loop  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.const 4
              i32.add
              i32.load
              local.tee 1
              i32.eqz
              br_if 0 (;@5;)
              local.get 3
              i32.load offset=28
              local.get 0
              i32.load
              local.get 1
              local.get 3
              i32.load offset=32
              i32.load offset=12
              call_indirect (type 1)
              br_if 3 (;@2;)
            end
            local.get 3
            local.get 5
            local.get 6
            i32.add
            local.tee 1
            i32.const 16
            i32.add
            i32.load
            i32.store offset=24
            local.get 3
            local.get 1
            i32.const 28
            i32.add
            i32.load8_u
            i32.store8 offset=40
            local.get 3
            local.get 1
            i32.const 24
            i32.add
            i32.load
            i32.store offset=36
            local.get 1
            i32.const 12
            i32.add
            i32.load
            local.set 10
            i32.const 0
            local.set 11
            i32.const 0
            local.set 7
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 1
                  i32.const 8
                  i32.add
                  i32.load
                  br_table 1 (;@6;) 0 (;@7;) 2 (;@5;) 1 (;@6;)
                end
                local.get 10
                i32.const 3
                i32.shl
                local.set 12
                i32.const 0
                local.set 7
                local.get 9
                local.get 12
                i32.add
                local.tee 12
                i32.load offset=4
                i32.const 18
                i32.ne
                br_if 1 (;@5;)
                local.get 12
                i32.load
                i32.load
                local.set 10
              end
              i32.const 1
              local.set 7
            end
            local.get 3
            local.get 10
            i32.store offset=12
            local.get 3
            local.get 7
            i32.store offset=8
            local.get 1
            i32.const 4
            i32.add
            i32.load
            local.set 7
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 1
                  i32.load
                  br_table 1 (;@6;) 0 (;@7;) 2 (;@5;) 1 (;@6;)
                end
                local.get 7
                i32.const 3
                i32.shl
                local.set 10
                local.get 9
                local.get 10
                i32.add
                local.tee 10
                i32.load offset=4
                i32.const 18
                i32.ne
                br_if 1 (;@5;)
                local.get 10
                i32.load
                i32.load
                local.set 7
              end
              i32.const 1
              local.set 11
            end
            local.get 3
            local.get 7
            i32.store offset=20
            local.get 3
            local.get 11
            i32.store offset=16
            local.get 9
            local.get 1
            i32.const 20
            i32.add
            i32.load
            i32.const 3
            i32.shl
            i32.add
            local.tee 1
            i32.load
            local.get 3
            i32.const 8
            i32.add
            local.get 1
            i32.load offset=4
            call_indirect (type 2)
            br_if 2 (;@2;)
            local.get 0
            i32.const 8
            i32.add
            local.set 0
            local.get 8
            local.get 6
            i32.const 32
            i32.add
            local.tee 6
            i32.ne
            br_if 0 (;@4;)
          end
        end
        block  ;; label = @3
          local.get 4
          local.get 2
          i32.load offset=4
          i32.ge_u
          br_if 0 (;@3;)
          local.get 2
          i32.load
          local.tee 1
          i32.eqz
          br_if 0 (;@3;)
          local.get 3
          i32.load offset=28
          local.get 1
          local.get 4
          i32.const 3
          i32.shl
          i32.add
          local.tee 1
          i32.load
          local.get 1
          i32.load offset=4
          local.get 3
          i32.load offset=32
          i32.load offset=12
          call_indirect (type 1)
          br_if 1 (;@2;)
        end
        i32.const 0
        local.set 1
        br 1 (;@1;)
      end
      i32.const 1
      local.set 1
    end
    local.get 3
    i32.const 48
    i32.add
    global.set $__stack_pointer
    local.get 1)
  (func $_ZN4core3fmt9Formatter12pad_integral17h7f32912d39031beeE (type 12) (param i32 i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.eqz
        br_if 0 (;@2;)
        i32.const 43
        i32.const 1114112
        local.get 0
        i32.load offset=28
        local.tee 6
        i32.const 1
        i32.and
        local.tee 1
        select
        local.set 7
        local.get 1
        local.get 5
        i32.add
        local.set 8
        br 1 (;@1;)
      end
      local.get 5
      i32.const 1
      i32.add
      local.set 8
      local.get 0
      i32.load offset=28
      local.set 6
      i32.const 45
      local.set 7
    end
    block  ;; label = @1
      block  ;; label = @2
        local.get 6
        i32.const 4
        i32.and
        br_if 0 (;@2;)
        i32.const 0
        local.set 2
        br 1 (;@1;)
      end
      block  ;; label = @2
        block  ;; label = @3
          local.get 3
          i32.const 16
          i32.lt_u
          br_if 0 (;@3;)
          local.get 2
          local.get 3
          call $_ZN4core3str5count14do_count_chars17ha8caff7fcf946f42E
          local.set 1
          br 1 (;@2;)
        end
        block  ;; label = @3
          local.get 3
          br_if 0 (;@3;)
          i32.const 0
          local.set 1
          br 1 (;@2;)
        end
        local.get 3
        i32.const 3
        i32.and
        local.set 9
        block  ;; label = @3
          block  ;; label = @4
            local.get 3
            i32.const 4
            i32.ge_u
            br_if 0 (;@4;)
            i32.const 0
            local.set 1
            i32.const 0
            local.set 10
            br 1 (;@3;)
          end
          local.get 3
          i32.const -4
          i32.and
          local.set 11
          i32.const 0
          local.set 1
          i32.const 0
          local.set 10
          loop  ;; label = @4
            local.get 1
            local.get 2
            local.get 10
            i32.add
            local.tee 12
            i32.load8_s
            i32.const -65
            i32.gt_s
            i32.add
            local.get 12
            i32.const 1
            i32.add
            i32.load8_s
            i32.const -65
            i32.gt_s
            i32.add
            local.get 12
            i32.const 2
            i32.add
            i32.load8_s
            i32.const -65
            i32.gt_s
            i32.add
            local.get 12
            i32.const 3
            i32.add
            i32.load8_s
            i32.const -65
            i32.gt_s
            i32.add
            local.set 1
            local.get 11
            local.get 10
            i32.const 4
            i32.add
            local.tee 10
            i32.ne
            br_if 0 (;@4;)
          end
        end
        local.get 9
        i32.eqz
        br_if 0 (;@2;)
        local.get 2
        local.get 10
        i32.add
        local.set 12
        loop  ;; label = @3
          local.get 1
          local.get 12
          i32.load8_s
          i32.const -65
          i32.gt_s
          i32.add
          local.set 1
          local.get 12
          i32.const 1
          i32.add
          local.set 12
          local.get 9
          i32.const -1
          i32.add
          local.tee 9
          br_if 0 (;@3;)
        end
      end
      local.get 1
      local.get 8
      i32.add
      local.set 8
    end
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i32.load
        br_if 0 (;@2;)
        i32.const 1
        local.set 1
        local.get 0
        i32.const 20
        i32.add
        i32.load
        local.tee 12
        local.get 0
        i32.const 24
        i32.add
        i32.load
        local.tee 10
        local.get 7
        local.get 2
        local.get 3
        call $_ZN4core3fmt9Formatter12pad_integral12write_prefix17h1bacd7b666b74db9E
        br_if 1 (;@1;)
        local.get 12
        local.get 4
        local.get 5
        local.get 10
        i32.load offset=12
        call_indirect (type 1)
        return
      end
      block  ;; label = @2
        local.get 0
        i32.load offset=4
        local.tee 9
        local.get 8
        i32.gt_u
        br_if 0 (;@2;)
        i32.const 1
        local.set 1
        local.get 0
        i32.const 20
        i32.add
        i32.load
        local.tee 12
        local.get 0
        i32.const 24
        i32.add
        i32.load
        local.tee 10
        local.get 7
        local.get 2
        local.get 3
        call $_ZN4core3fmt9Formatter12pad_integral12write_prefix17h1bacd7b666b74db9E
        br_if 1 (;@1;)
        local.get 12
        local.get 4
        local.get 5
        local.get 10
        i32.load offset=12
        call_indirect (type 1)
        return
      end
      block  ;; label = @2
        local.get 6
        i32.const 8
        i32.and
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=16
        local.set 11
        local.get 0
        i32.const 48
        i32.store offset=16
        local.get 0
        i32.load8_u offset=32
        local.set 6
        i32.const 1
        local.set 1
        local.get 0
        i32.const 1
        i32.store8 offset=32
        local.get 0
        i32.const 20
        i32.add
        i32.load
        local.tee 12
        local.get 0
        i32.const 24
        i32.add
        i32.load
        local.tee 10
        local.get 7
        local.get 2
        local.get 3
        call $_ZN4core3fmt9Formatter12pad_integral12write_prefix17h1bacd7b666b74db9E
        br_if 1 (;@1;)
        local.get 9
        local.get 8
        i32.sub
        i32.const 1
        i32.add
        local.set 1
        block  ;; label = @3
          loop  ;; label = @4
            local.get 1
            i32.const -1
            i32.add
            local.tee 1
            i32.eqz
            br_if 1 (;@3;)
            local.get 12
            i32.const 48
            local.get 10
            i32.load offset=16
            call_indirect (type 2)
            i32.eqz
            br_if 0 (;@4;)
          end
          i32.const 1
          return
        end
        i32.const 1
        local.set 1
        local.get 12
        local.get 4
        local.get 5
        local.get 10
        i32.load offset=12
        call_indirect (type 1)
        br_if 1 (;@1;)
        local.get 0
        local.get 6
        i32.store8 offset=32
        local.get 0
        local.get 11
        i32.store offset=16
        i32.const 0
        local.set 1
        br 1 (;@1;)
      end
      local.get 9
      local.get 8
      i32.sub
      local.set 8
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load8_u offset=32
            local.tee 1
            br_table 2 (;@2;) 0 (;@4;) 1 (;@3;) 0 (;@4;) 2 (;@2;)
          end
          local.get 8
          local.set 1
          i32.const 0
          local.set 8
          br 1 (;@2;)
        end
        local.get 8
        i32.const 1
        i32.shr_u
        local.set 1
        local.get 8
        i32.const 1
        i32.add
        i32.const 1
        i32.shr_u
        local.set 8
      end
      local.get 1
      i32.const 1
      i32.add
      local.set 1
      local.get 0
      i32.const 24
      i32.add
      i32.load
      local.set 10
      local.get 0
      i32.const 20
      i32.add
      i32.load
      local.set 9
      local.get 0
      i32.load offset=16
      local.set 12
      block  ;; label = @2
        loop  ;; label = @3
          local.get 1
          i32.const -1
          i32.add
          local.tee 1
          i32.eqz
          br_if 1 (;@2;)
          local.get 9
          local.get 12
          local.get 10
          i32.load offset=16
          call_indirect (type 2)
          i32.eqz
          br_if 0 (;@3;)
        end
        i32.const 1
        return
      end
      i32.const 1
      local.set 1
      local.get 12
      i32.const 1114112
      i32.eq
      br_if 0 (;@1;)
      local.get 9
      local.get 10
      local.get 7
      local.get 2
      local.get 3
      call $_ZN4core3fmt9Formatter12pad_integral12write_prefix17h1bacd7b666b74db9E
      br_if 0 (;@1;)
      local.get 9
      local.get 4
      local.get 5
      local.get 10
      i32.load offset=12
      call_indirect (type 1)
      br_if 0 (;@1;)
      i32.const 0
      local.set 1
      loop  ;; label = @2
        block  ;; label = @3
          local.get 8
          local.get 1
          i32.ne
          br_if 0 (;@3;)
          local.get 8
          local.get 8
          i32.lt_u
          return
        end
        local.get 1
        i32.const 1
        i32.add
        local.set 1
        local.get 9
        local.get 12
        local.get 10
        i32.load offset=16
        call_indirect (type 2)
        i32.eqz
        br_if 0 (;@2;)
      end
      local.get 1
      i32.const -1
      i32.add
      local.get 8
      i32.lt_u
      return
    end
    local.get 1)
  (func $_ZN71_$LT$core..ops..range..Range$LT$Idx$GT$$u20$as$u20$core..fmt..Debug$GT$3fmt17h42757caa5af7fe94E (type 2) (param i32 i32) (result i32)
    (local i32 i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    i32.const 1
    local.set 3
    block  ;; label = @1
      local.get 0
      local.get 1
      call $_ZN4core3fmt3num50_$LT$impl$u20$core..fmt..Debug$u20$for$u20$u32$GT$3fmt17h755d20114b075bd4E
      br_if 0 (;@1;)
      local.get 2
      i32.const 20
      i32.add
      i64.const 0
      i64.store align=4
      i32.const 1
      local.set 3
      local.get 2
      i32.const 1
      i32.store offset=12
      local.get 2
      i32.const 1049472
      i32.store offset=8
      local.get 2
      i32.const 1049400
      i32.store offset=16
      local.get 1
      i32.load offset=20
      local.get 1
      i32.const 24
      i32.add
      i32.load
      local.get 2
      i32.const 8
      i32.add
      call $_ZN4core3fmt5write17hcc90208b612ee6d9E
      br_if 0 (;@1;)
      local.get 0
      i32.const 4
      i32.add
      local.get 1
      call $_ZN4core3fmt3num50_$LT$impl$u20$core..fmt..Debug$u20$for$u20$u32$GT$3fmt17h755d20114b075bd4E
      local.set 3
    end
    local.get 2
    i32.const 32
    i32.add
    global.set $__stack_pointer
    local.get 3)
  (func $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17hfb7c746da5264eccE (type 0) (param i32 i32)
    local.get 0
    i64.const 7714510750261652668
    i64.store offset=8
    local.get 0
    i64.const 3892613385407120629
    i64.store)
  (func $_ZN4core4char7methods22_$LT$impl$u20$char$GT$16escape_debug_ext17h4c316730ec24ddc6E (type 4) (param i32 i32 i32)
    (local i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        local.get 1
                        br_table 5 (;@5;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 1 (;@9;) 3 (;@7;) 8 (;@2;) 8 (;@2;) 2 (;@8;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 6 (;@4;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 8 (;@2;) 7 (;@3;) 0 (;@10;)
                      end
                      local.get 1
                      i32.const 92
                      i32.eq
                      br_if 3 (;@6;)
                      br 7 (;@2;)
                    end
                    local.get 0
                    i32.const 512
                    i32.store16 offset=10
                    local.get 0
                    i64.const 0
                    i64.store offset=2 align=2
                    local.get 0
                    i32.const 29788
                    i32.store16
                    br 7 (;@1;)
                  end
                  local.get 0
                  i32.const 512
                  i32.store16 offset=10
                  local.get 0
                  i64.const 0
                  i64.store offset=2 align=2
                  local.get 0
                  i32.const 29276
                  i32.store16
                  br 6 (;@1;)
                end
                local.get 0
                i32.const 512
                i32.store16 offset=10
                local.get 0
                i64.const 0
                i64.store offset=2 align=2
                local.get 0
                i32.const 28252
                i32.store16
                br 5 (;@1;)
              end
              local.get 0
              i32.const 512
              i32.store16 offset=10
              local.get 0
              i64.const 0
              i64.store offset=2 align=2
              local.get 0
              i32.const 23644
              i32.store16
              br 4 (;@1;)
            end
            local.get 0
            i32.const 512
            i32.store16 offset=10
            local.get 0
            i64.const 0
            i64.store offset=2 align=2
            local.get 0
            i32.const 12380
            i32.store16
            br 3 (;@1;)
          end
          local.get 2
          i32.const 65536
          i32.and
          i32.eqz
          br_if 1 (;@2;)
          local.get 0
          i32.const 512
          i32.store16 offset=10
          local.get 0
          i64.const 0
          i64.store offset=2 align=2
          local.get 0
          i32.const 8796
          i32.store16
          br 2 (;@1;)
        end
        local.get 2
        i32.const 256
        i32.and
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.const 512
        i32.store16 offset=10
        local.get 0
        i64.const 0
        i64.store offset=2 align=2
        local.get 0
        i32.const 10076
        i32.store16
        br 1 (;@1;)
      end
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 2
                i32.const 1
                i32.and
                i32.eqz
                br_if 0 (;@6;)
                local.get 1
                call $_ZN4core7unicode12unicode_data15grapheme_extend6lookup17h0e478d906fe4f0c2E
                br_if 1 (;@5;)
              end
              local.get 1
              call $_ZN4core7unicode9printable12is_printable17h39f775875f551815E
              i32.eqz
              br_if 1 (;@4;)
              local.get 0
              local.get 1
              i32.store offset=4
              local.get 0
              i32.const 128
              i32.store8
              br 4 (;@1;)
            end
            local.get 3
            i32.const 6
            i32.add
            i32.const 2
            i32.add
            i32.const 0
            i32.store8
            local.get 3
            i32.const 0
            i32.store16 offset=6
            local.get 3
            i32.const 125
            i32.store8 offset=15
            local.get 3
            local.get 1
            i32.const 15
            i32.and
            i32.const 1051812
            i32.add
            i32.load8_u
            i32.store8 offset=14
            local.get 3
            local.get 1
            i32.const 4
            i32.shr_u
            i32.const 15
            i32.and
            i32.const 1051812
            i32.add
            i32.load8_u
            i32.store8 offset=13
            local.get 3
            local.get 1
            i32.const 8
            i32.shr_u
            i32.const 15
            i32.and
            i32.const 1051812
            i32.add
            i32.load8_u
            i32.store8 offset=12
            local.get 3
            local.get 1
            i32.const 12
            i32.shr_u
            i32.const 15
            i32.and
            i32.const 1051812
            i32.add
            i32.load8_u
            i32.store8 offset=11
            local.get 3
            local.get 1
            i32.const 16
            i32.shr_u
            i32.const 15
            i32.and
            i32.const 1051812
            i32.add
            i32.load8_u
            i32.store8 offset=10
            local.get 3
            local.get 1
            i32.const 20
            i32.shr_u
            i32.const 15
            i32.and
            i32.const 1051812
            i32.add
            i32.load8_u
            i32.store8 offset=9
            local.get 1
            i32.const 1
            i32.or
            i32.clz
            i32.const 2
            i32.shr_u
            i32.const -2
            i32.add
            local.tee 1
            i32.const 11
            i32.ge_u
            br_if 1 (;@3;)
            local.get 3
            i32.const 6
            i32.add
            local.get 1
            i32.add
            local.tee 2
            i32.const 0
            i32.load16_u offset=1051872 align=1
            i32.store16 align=1
            local.get 2
            i32.const 2
            i32.add
            i32.const 0
            i32.load8_u offset=1051874
            i32.store8
            local.get 0
            local.get 3
            i64.load offset=6 align=2
            i64.store align=1
            local.get 0
            i32.const 8
            i32.add
            local.get 3
            i32.const 6
            i32.add
            i32.const 8
            i32.add
            i32.load16_u
            i32.store16 align=1
            local.get 0
            i32.const 10
            i32.store8 offset=11
            local.get 0
            local.get 1
            i32.store8 offset=10
            br 3 (;@1;)
          end
          local.get 3
          i32.const 6
          i32.add
          i32.const 2
          i32.add
          i32.const 0
          i32.store8
          local.get 3
          i32.const 0
          i32.store16 offset=6
          local.get 3
          i32.const 125
          i32.store8 offset=15
          local.get 3
          local.get 1
          i32.const 15
          i32.and
          i32.const 1051812
          i32.add
          i32.load8_u
          i32.store8 offset=14
          local.get 3
          local.get 1
          i32.const 4
          i32.shr_u
          i32.const 15
          i32.and
          i32.const 1051812
          i32.add
          i32.load8_u
          i32.store8 offset=13
          local.get 3
          local.get 1
          i32.const 8
          i32.shr_u
          i32.const 15
          i32.and
          i32.const 1051812
          i32.add
          i32.load8_u
          i32.store8 offset=12
          local.get 3
          local.get 1
          i32.const 12
          i32.shr_u
          i32.const 15
          i32.and
          i32.const 1051812
          i32.add
          i32.load8_u
          i32.store8 offset=11
          local.get 3
          local.get 1
          i32.const 16
          i32.shr_u
          i32.const 15
          i32.and
          i32.const 1051812
          i32.add
          i32.load8_u
          i32.store8 offset=10
          local.get 3
          local.get 1
          i32.const 20
          i32.shr_u
          i32.const 15
          i32.and
          i32.const 1051812
          i32.add
          i32.load8_u
          i32.store8 offset=9
          local.get 1
          i32.const 1
          i32.or
          i32.clz
          i32.const 2
          i32.shr_u
          i32.const -2
          i32.add
          local.tee 1
          i32.const 11
          i32.ge_u
          br_if 1 (;@2;)
          local.get 3
          i32.const 6
          i32.add
          local.get 1
          i32.add
          local.tee 2
          i32.const 0
          i32.load16_u offset=1051872 align=1
          i32.store16 align=1
          local.get 2
          i32.const 2
          i32.add
          i32.const 0
          i32.load8_u offset=1051874
          i32.store8
          local.get 0
          local.get 3
          i64.load offset=6 align=2
          i64.store align=1
          local.get 0
          i32.const 8
          i32.add
          local.get 3
          i32.const 6
          i32.add
          i32.const 8
          i32.add
          i32.load16_u
          i32.store16 align=1
          local.get 0
          i32.const 10
          i32.store8 offset=11
          local.get 0
          local.get 1
          i32.store8 offset=10
          br 2 (;@1;)
        end
        local.get 1
        i32.const 10
        i32.const 1051856
        call $_ZN4core5slice5index26slice_start_index_len_fail17hf84a6cbd5b9bf444E
        unreachable
      end
      local.get 1
      i32.const 10
      i32.const 1051856
      call $_ZN4core5slice5index26slice_start_index_len_fail17hf84a6cbd5b9bf444E
      unreachable
    end
    local.get 3
    i32.const 16
    i32.add
    global.set $__stack_pointer)
  (func $_ZN4core7unicode12unicode_data15grapheme_extend6lookup17h0e478d906fe4f0c2E (type 7) (param i32) (result i32)
    (local i32 i32 i32 i32 i32)
    local.get 0
    i32.const 11
    i32.shl
    local.set 1
    i32.const 0
    local.set 2
    i32.const 33
    local.set 3
    i32.const 33
    local.set 4
    block  ;; label = @1
      block  ;; label = @2
        loop  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              i32.const -1
              local.get 3
              i32.const 1
              i32.shr_u
              local.get 2
              i32.add
              local.tee 5
              i32.const 2
              i32.shl
              i32.const 1051892
              i32.add
              i32.load
              i32.const 11
              i32.shl
              local.tee 3
              local.get 1
              i32.ne
              local.get 3
              local.get 1
              i32.lt_u
              select
              local.tee 3
              i32.const 1
              i32.ne
              br_if 0 (;@5;)
              local.get 5
              local.set 4
              br 1 (;@4;)
            end
            local.get 3
            i32.const 255
            i32.and
            i32.const 255
            i32.ne
            br_if 2 (;@2;)
            local.get 5
            i32.const 1
            i32.add
            local.set 2
          end
          local.get 4
          local.get 2
          i32.sub
          local.set 3
          local.get 4
          local.get 2
          i32.gt_u
          br_if 0 (;@3;)
          br 2 (;@1;)
        end
      end
      local.get 5
      i32.const 1
      i32.add
      local.set 2
    end
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 2
              i32.const 32
              i32.gt_u
              br_if 0 (;@5;)
              local.get 2
              i32.const 2
              i32.shl
              local.tee 1
              i32.const 1051892
              i32.add
              i32.load
              i32.const 21
              i32.shr_u
              local.set 4
              local.get 2
              i32.const 32
              i32.ne
              br_if 1 (;@4;)
              i32.const 727
              local.set 5
              i32.const 31
              local.set 2
              br 2 (;@3;)
            end
            local.get 2
            i32.const 33
            i32.const 1051780
            call $_ZN4core9panicking18panic_bounds_check17h113d0e7204064fb4E
            unreachable
          end
          local.get 1
          i32.const 1051896
          i32.add
          i32.load
          i32.const 21
          i32.shr_u
          local.set 5
          local.get 2
          i32.eqz
          br_if 1 (;@2;)
          local.get 2
          i32.const -1
          i32.add
          local.set 2
        end
        local.get 2
        i32.const 2
        i32.shl
        i32.const 1051892
        i32.add
        i32.load
        i32.const 2097151
        i32.and
        local.set 2
        br 1 (;@1;)
      end
      i32.const 0
      local.set 2
    end
    block  ;; label = @1
      block  ;; label = @2
        local.get 5
        local.get 4
        i32.const -1
        i32.xor
        i32.add
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        local.get 2
        i32.sub
        local.set 3
        local.get 4
        i32.const 727
        local.get 4
        i32.const 727
        i32.gt_u
        select
        local.set 1
        local.get 5
        i32.const -1
        i32.add
        local.set 5
        i32.const 0
        local.set 2
        loop  ;; label = @3
          local.get 1
          local.get 4
          i32.eq
          br_if 2 (;@1;)
          local.get 2
          local.get 4
          i32.const 1052024
          i32.add
          i32.load8_u
          i32.add
          local.tee 2
          local.get 3
          i32.gt_u
          br_if 1 (;@2;)
          local.get 5
          local.get 4
          i32.const 1
          i32.add
          local.tee 4
          i32.ne
          br_if 0 (;@3;)
        end
        local.get 5
        local.set 4
      end
      local.get 4
      i32.const 1
      i32.and
      return
    end
    local.get 1
    i32.const 727
    i32.const 1051796
    call $_ZN4core9panicking18panic_bounds_check17h113d0e7204064fb4E
    unreachable)
  (func $_ZN4core7unicode9printable12is_printable17h39f775875f551815E (type 7) (param i32) (result i32)
    (local i32)
    block  ;; label = @1
      local.get 0
      i32.const 32
      i32.ge_u
      br_if 0 (;@1;)
      i32.const 0
      return
    end
    i32.const 1
    local.set 1
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i32.const 127
        i32.lt_u
        br_if 0 (;@2;)
        local.get 0
        i32.const 65536
        i32.lt_u
        br_if 1 (;@1;)
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.const 131072
            i32.lt_u
            br_if 0 (;@4;)
            block  ;; label = @5
              local.get 0
              i32.const -205744
              i32.add
              i32.const 712016
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              return
            end
            block  ;; label = @5
              local.get 0
              i32.const -201547
              i32.add
              i32.const 5
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              return
            end
            block  ;; label = @5
              local.get 0
              i32.const -195102
              i32.add
              i32.const 1506
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              return
            end
            block  ;; label = @5
              local.get 0
              i32.const -191457
              i32.add
              i32.const 3103
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              return
            end
            block  ;; label = @5
              local.get 0
              i32.const -183970
              i32.add
              i32.const 14
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              return
            end
            block  ;; label = @5
              local.get 0
              i32.const -2
              i32.and
              i32.const 178206
              i32.ne
              br_if 0 (;@5;)
              i32.const 0
              return
            end
            local.get 0
            i32.const -32
            i32.and
            i32.const 173792
            i32.ne
            br_if 1 (;@3;)
            i32.const 0
            return
          end
          local.get 0
          i32.const 1050336
          i32.const 44
          i32.const 1050424
          i32.const 196
          i32.const 1050620
          i32.const 450
          call $_ZN4core7unicode9printable5check17hb69480130f9999f2E
          return
        end
        i32.const 0
        local.set 1
        local.get 0
        i32.const -177978
        i32.add
        i32.const 6
        i32.lt_u
        br_if 0 (;@2;)
        local.get 0
        i32.const -1114112
        i32.add
        i32.const -196112
        i32.lt_u
        local.set 1
      end
      local.get 1
      return
    end
    local.get 0
    i32.const 1051070
    i32.const 40
    i32.const 1051150
    i32.const 287
    i32.const 1051437
    i32.const 303
    call $_ZN4core7unicode9printable5check17hb69480130f9999f2E)
  (func $_ZN44_$LT$$RF$T$u20$as$u20$core..fmt..Display$GT$3fmt17h0192f98da0136ea1E (type 2) (param i32 i32) (result i32)
    local.get 1
    local.get 0
    i32.load
    local.get 0
    i32.load offset=4
    call $_ZN4core3fmt9Formatter3pad17h2cda20b35f9c0236E)
  (func $_ZN4core5panic10panic_info9PanicInfo7message17h5320e6c2c0b4337cE (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=12)
  (func $_ZN4core5panic10panic_info9PanicInfo8location17he81fea1bebe4ca73E (type 7) (param i32) (result i32)
    local.get 0
    i32.load offset=8)
  (func $_ZN4core5panic10panic_info9PanicInfo10can_unwind17h83aa558ac009d718E (type 7) (param i32) (result i32)
    local.get 0
    i32.load8_u offset=16)
  (func $_ZN4core3str5count14do_count_chars17ha8caff7fcf946f42E (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i32.const 3
        i32.add
        i32.const -4
        i32.and
        local.tee 2
        local.get 0
        i32.sub
        local.tee 3
        local.get 1
        i32.gt_u
        br_if 0 (;@2;)
        local.get 1
        local.get 3
        i32.sub
        local.tee 4
        i32.const 4
        i32.lt_u
        br_if 0 (;@2;)
        local.get 4
        i32.const 3
        i32.and
        local.set 5
        i32.const 0
        local.set 6
        i32.const 0
        local.set 1
        block  ;; label = @3
          local.get 2
          local.get 0
          i32.eq
          br_if 0 (;@3;)
          local.get 3
          i32.const 3
          i32.and
          local.set 7
          block  ;; label = @4
            block  ;; label = @5
              local.get 2
              local.get 0
              i32.const -1
              i32.xor
              i32.add
              i32.const 3
              i32.ge_u
              br_if 0 (;@5;)
              i32.const 0
              local.set 1
              i32.const 0
              local.set 8
              br 1 (;@4;)
            end
            local.get 3
            i32.const -4
            i32.and
            local.set 9
            i32.const 0
            local.set 1
            i32.const 0
            local.set 8
            loop  ;; label = @5
              local.get 1
              local.get 0
              local.get 8
              i32.add
              local.tee 2
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.get 2
              i32.const 1
              i32.add
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.get 2
              i32.const 2
              i32.add
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.get 2
              i32.const 3
              i32.add
              i32.load8_s
              i32.const -65
              i32.gt_s
              i32.add
              local.set 1
              local.get 9
              local.get 8
              i32.const 4
              i32.add
              local.tee 8
              i32.ne
              br_if 0 (;@5;)
            end
          end
          local.get 7
          i32.eqz
          br_if 0 (;@3;)
          local.get 0
          local.get 8
          i32.add
          local.set 2
          loop  ;; label = @4
            local.get 1
            local.get 2
            i32.load8_s
            i32.const -65
            i32.gt_s
            i32.add
            local.set 1
            local.get 2
            i32.const 1
            i32.add
            local.set 2
            local.get 7
            i32.const -1
            i32.add
            local.tee 7
            br_if 0 (;@4;)
          end
        end
        local.get 0
        local.get 3
        i32.add
        local.set 8
        block  ;; label = @3
          local.get 5
          i32.eqz
          br_if 0 (;@3;)
          local.get 8
          local.get 4
          i32.const -4
          i32.and
          i32.add
          local.tee 2
          i32.load8_s
          i32.const -65
          i32.gt_s
          local.set 6
          local.get 5
          i32.const 1
          i32.eq
          br_if 0 (;@3;)
          local.get 6
          local.get 2
          i32.load8_s offset=1
          i32.const -65
          i32.gt_s
          i32.add
          local.set 6
          local.get 5
          i32.const 2
          i32.eq
          br_if 0 (;@3;)
          local.get 6
          local.get 2
          i32.load8_s offset=2
          i32.const -65
          i32.gt_s
          i32.add
          local.set 6
        end
        local.get 4
        i32.const 2
        i32.shr_u
        local.set 9
        local.get 6
        local.get 1
        i32.add
        local.set 7
        loop  ;; label = @3
          local.get 8
          local.set 4
          local.get 9
          i32.eqz
          br_if 2 (;@1;)
          local.get 9
          i32.const 192
          local.get 9
          i32.const 192
          i32.lt_u
          select
          local.tee 3
          i32.const 3
          i32.and
          local.set 6
          local.get 3
          i32.const 2
          i32.shl
          local.set 5
          block  ;; label = @4
            block  ;; label = @5
              local.get 3
              i32.const 252
              i32.and
              local.tee 10
              br_if 0 (;@5;)
              i32.const 0
              local.set 2
              br 1 (;@4;)
            end
            local.get 4
            local.get 10
            i32.const 2
            i32.shl
            i32.add
            local.set 0
            i32.const 0
            local.set 2
            local.get 4
            local.set 1
            loop  ;; label = @5
              local.get 1
              i32.eqz
              br_if 1 (;@4;)
              local.get 1
              i32.const 12
              i32.add
              i32.load
              local.tee 8
              i32.const -1
              i32.xor
              i32.const 7
              i32.shr_u
              local.get 8
              i32.const 6
              i32.shr_u
              i32.or
              i32.const 16843009
              i32.and
              local.get 1
              i32.const 8
              i32.add
              i32.load
              local.tee 8
              i32.const -1
              i32.xor
              i32.const 7
              i32.shr_u
              local.get 8
              i32.const 6
              i32.shr_u
              i32.or
              i32.const 16843009
              i32.and
              local.get 1
              i32.const 4
              i32.add
              i32.load
              local.tee 8
              i32.const -1
              i32.xor
              i32.const 7
              i32.shr_u
              local.get 8
              i32.const 6
              i32.shr_u
              i32.or
              i32.const 16843009
              i32.and
              local.get 1
              i32.load
              local.tee 8
              i32.const -1
              i32.xor
              i32.const 7
              i32.shr_u
              local.get 8
              i32.const 6
              i32.shr_u
              i32.or
              i32.const 16843009
              i32.and
              local.get 2
              i32.add
              i32.add
              i32.add
              i32.add
              local.set 2
              local.get 1
              i32.const 16
              i32.add
              local.tee 1
              local.get 0
              i32.ne
              br_if 0 (;@5;)
            end
          end
          local.get 9
          local.get 3
          i32.sub
          local.set 9
          local.get 4
          local.get 5
          i32.add
          local.set 8
          local.get 2
          i32.const 8
          i32.shr_u
          i32.const 16711935
          i32.and
          local.get 2
          i32.const 16711935
          i32.and
          i32.add
          i32.const 65537
          i32.mul
          i32.const 16
          i32.shr_u
          local.get 7
          i32.add
          local.set 7
          local.get 6
          i32.eqz
          br_if 0 (;@3;)
        end
        block  ;; label = @3
          block  ;; label = @4
            local.get 4
            br_if 0 (;@4;)
            i32.const 0
            local.set 1
            br 1 (;@3;)
          end
          local.get 4
          local.get 10
          i32.const 2
          i32.shl
          i32.add
          local.tee 2
          i32.load
          local.tee 1
          i32.const -1
          i32.xor
          i32.const 7
          i32.shr_u
          local.get 1
          i32.const 6
          i32.shr_u
          i32.or
          i32.const 16843009
          i32.and
          local.set 1
          local.get 6
          i32.const 1
          i32.eq
          br_if 0 (;@3;)
          local.get 2
          i32.load offset=4
          local.tee 8
          i32.const -1
          i32.xor
          i32.const 7
          i32.shr_u
          local.get 8
          i32.const 6
          i32.shr_u
          i32.or
          i32.const 16843009
          i32.and
          local.get 1
          i32.add
          local.set 1
          local.get 6
          i32.const 2
          i32.eq
          br_if 0 (;@3;)
          local.get 2
          i32.load offset=8
          local.tee 2
          i32.const -1
          i32.xor
          i32.const 7
          i32.shr_u
          local.get 2
          i32.const 6
          i32.shr_u
          i32.or
          i32.const 16843009
          i32.and
          local.get 1
          i32.add
          local.set 1
        end
        local.get 1
        i32.const 8
        i32.shr_u
        i32.const 459007
        i32.and
        local.get 1
        i32.const 16711935
        i32.and
        i32.add
        i32.const 65537
        i32.mul
        i32.const 16
        i32.shr_u
        local.get 7
        i32.add
        local.set 7
        br 1 (;@1;)
      end
      block  ;; label = @2
        local.get 1
        br_if 0 (;@2;)
        i32.const 0
        return
      end
      local.get 1
      i32.const 3
      i32.and
      local.set 8
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          i32.const 4
          i32.ge_u
          br_if 0 (;@3;)
          i32.const 0
          local.set 7
          i32.const 0
          local.set 2
          br 1 (;@2;)
        end
        local.get 1
        i32.const -4
        i32.and
        local.set 9
        i32.const 0
        local.set 7
        i32.const 0
        local.set 2
        loop  ;; label = @3
          local.get 7
          local.get 0
          local.get 2
          i32.add
          local.tee 1
          i32.load8_s
          i32.const -65
          i32.gt_s
          i32.add
          local.get 1
          i32.const 1
          i32.add
          i32.load8_s
          i32.const -65
          i32.gt_s
          i32.add
          local.get 1
          i32.const 2
          i32.add
          i32.load8_s
          i32.const -65
          i32.gt_s
          i32.add
          local.get 1
          i32.const 3
          i32.add
          i32.load8_s
          i32.const -65
          i32.gt_s
          i32.add
          local.set 7
          local.get 9
          local.get 2
          i32.const 4
          i32.add
          local.tee 2
          i32.ne
          br_if 0 (;@3;)
        end
      end
      local.get 8
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      local.get 2
      i32.add
      local.set 1
      loop  ;; label = @2
        local.get 7
        local.get 1
        i32.load8_s
        i32.const -65
        i32.gt_s
        i32.add
        local.set 7
        local.get 1
        i32.const 1
        i32.add
        local.set 1
        local.get 8
        i32.const -1
        i32.add
        local.tee 8
        br_if 0 (;@2;)
      end
    end
    local.get 7)
  (func $_ZN4core3fmt9Formatter12pad_integral12write_prefix17h1bacd7b666b74db9E (type 11) (param i32 i32 i32 i32 i32) (result i32)
    (local i32)
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 2
          i32.const 1114112
          i32.eq
          br_if 0 (;@3;)
          i32.const 1
          local.set 5
          local.get 0
          local.get 2
          local.get 1
          i32.load offset=16
          call_indirect (type 2)
          br_if 1 (;@2;)
        end
        local.get 3
        br_if 1 (;@1;)
        i32.const 0
        local.set 5
      end
      local.get 5
      return
    end
    local.get 0
    local.get 3
    local.get 4
    local.get 1
    i32.load offset=12
    call_indirect (type 1))
  (func $_ZN4core3str16slice_error_fail17h8d3faa8d421e4471E (type 9) (param i32 i32 i32 i32 i32)
    local.get 0
    local.get 1
    local.get 2
    local.get 3
    local.get 4
    call $_ZN4core3str19slice_error_fail_rt17h206dba6f8cfb4122E
    unreachable)
  (func $_ZN40_$LT$str$u20$as$u20$core..fmt..Debug$GT$3fmt17h060b461cb37d01e2E (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i64 i32)
    global.get $__stack_pointer
    i32.const 32
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    i32.const 1
    local.set 4
    block  ;; label = @1
      block  ;; label = @2
        local.get 2
        i32.load offset=20
        local.tee 5
        i32.const 34
        local.get 2
        i32.const 24
        i32.add
        i32.load
        local.tee 6
        i32.load offset=16
        local.tee 7
        call_indirect (type 2)
        br_if 0 (;@2;)
        block  ;; label = @3
          block  ;; label = @4
            local.get 1
            br_if 0 (;@4;)
            i32.const 0
            local.set 2
            i32.const 0
            local.set 1
            br 1 (;@3;)
          end
          local.get 0
          local.get 1
          i32.add
          local.set 8
          i32.const 0
          local.set 2
          local.get 0
          local.set 9
          i32.const 0
          local.set 10
          block  ;; label = @4
            block  ;; label = @5
              loop  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    local.get 9
                    local.tee 11
                    i32.load8_s
                    local.tee 12
                    i32.const -1
                    i32.le_s
                    br_if 0 (;@8;)
                    local.get 11
                    i32.const 1
                    i32.add
                    local.set 9
                    local.get 12
                    i32.const 255
                    i32.and
                    local.set 13
                    br 1 (;@7;)
                  end
                  local.get 11
                  i32.load8_u offset=1
                  i32.const 63
                  i32.and
                  local.set 14
                  local.get 12
                  i32.const 31
                  i32.and
                  local.set 15
                  block  ;; label = @8
                    local.get 12
                    i32.const -33
                    i32.gt_u
                    br_if 0 (;@8;)
                    local.get 15
                    i32.const 6
                    i32.shl
                    local.get 14
                    i32.or
                    local.set 13
                    local.get 11
                    i32.const 2
                    i32.add
                    local.set 9
                    br 1 (;@7;)
                  end
                  local.get 14
                  i32.const 6
                  i32.shl
                  local.get 11
                  i32.load8_u offset=2
                  i32.const 63
                  i32.and
                  i32.or
                  local.set 14
                  local.get 11
                  i32.const 3
                  i32.add
                  local.set 9
                  block  ;; label = @8
                    local.get 12
                    i32.const -16
                    i32.ge_u
                    br_if 0 (;@8;)
                    local.get 14
                    local.get 15
                    i32.const 12
                    i32.shl
                    i32.or
                    local.set 13
                    br 1 (;@7;)
                  end
                  local.get 14
                  i32.const 6
                  i32.shl
                  local.get 9
                  i32.load8_u
                  i32.const 63
                  i32.and
                  i32.or
                  local.get 15
                  i32.const 18
                  i32.shl
                  i32.const 1835008
                  i32.and
                  i32.or
                  local.tee 13
                  i32.const 1114112
                  i32.eq
                  br_if 3 (;@4;)
                  local.get 11
                  i32.const 4
                  i32.add
                  local.set 9
                end
                local.get 3
                local.get 13
                i32.const 65537
                call $_ZN4core4char7methods22_$LT$impl$u20$char$GT$16escape_debug_ext17h4c316730ec24ddc6E
                block  ;; label = @7
                  block  ;; label = @8
                    local.get 3
                    i32.load8_u
                    i32.const 128
                    i32.eq
                    br_if 0 (;@8;)
                    local.get 3
                    i32.load8_u offset=11
                    local.get 3
                    i32.load8_u offset=10
                    i32.sub
                    i32.const 255
                    i32.and
                    i32.const 1
                    i32.eq
                    br_if 0 (;@8;)
                    local.get 10
                    local.get 2
                    i32.lt_u
                    br_if 3 (;@5;)
                    block  ;; label = @9
                      local.get 2
                      i32.eqz
                      br_if 0 (;@9;)
                      block  ;; label = @10
                        local.get 2
                        local.get 1
                        i32.lt_u
                        br_if 0 (;@10;)
                        local.get 2
                        local.get 1
                        i32.eq
                        br_if 1 (;@9;)
                        br 5 (;@5;)
                      end
                      local.get 0
                      local.get 2
                      i32.add
                      i32.load8_s
                      i32.const -64
                      i32.lt_s
                      br_if 4 (;@5;)
                    end
                    block  ;; label = @9
                      local.get 10
                      i32.eqz
                      br_if 0 (;@9;)
                      block  ;; label = @10
                        local.get 10
                        local.get 1
                        i32.lt_u
                        br_if 0 (;@10;)
                        local.get 10
                        local.get 1
                        i32.eq
                        br_if 1 (;@9;)
                        br 5 (;@5;)
                      end
                      local.get 0
                      local.get 10
                      i32.add
                      i32.load8_s
                      i32.const -65
                      i32.le_s
                      br_if 4 (;@5;)
                    end
                    block  ;; label = @9
                      block  ;; label = @10
                        local.get 5
                        local.get 0
                        local.get 2
                        i32.add
                        local.get 10
                        local.get 2
                        i32.sub
                        local.get 6
                        i32.load offset=12
                        call_indirect (type 1)
                        br_if 0 (;@10;)
                        local.get 3
                        i32.const 16
                        i32.add
                        i32.const 8
                        i32.add
                        local.tee 15
                        local.get 3
                        i32.const 8
                        i32.add
                        i32.load
                        i32.store
                        local.get 3
                        local.get 3
                        i64.load
                        local.tee 16
                        i64.store offset=16
                        block  ;; label = @11
                          local.get 16
                          i32.wrap_i64
                          i32.const 255
                          i32.and
                          i32.const 128
                          i32.ne
                          br_if 0 (;@11;)
                          i32.const 128
                          local.set 14
                          loop  ;; label = @12
                            block  ;; label = @13
                              block  ;; label = @14
                                local.get 14
                                i32.const 255
                                i32.and
                                i32.const 128
                                i32.eq
                                br_if 0 (;@14;)
                                local.get 3
                                i32.load8_u offset=26
                                local.tee 12
                                local.get 3
                                i32.load8_u offset=27
                                i32.ge_u
                                br_if 5 (;@9;)
                                local.get 3
                                local.get 12
                                i32.const 1
                                i32.add
                                i32.store8 offset=26
                                local.get 12
                                i32.const 10
                                i32.ge_u
                                br_if 7 (;@7;)
                                local.get 3
                                i32.const 16
                                i32.add
                                local.get 12
                                i32.add
                                i32.load8_u
                                local.set 2
                                br 1 (;@13;)
                              end
                              i32.const 0
                              local.set 14
                              local.get 15
                              i32.const 0
                              i32.store
                              local.get 3
                              i32.load offset=20
                              local.set 2
                              local.get 3
                              i64.const 0
                              i64.store offset=16
                            end
                            local.get 5
                            local.get 2
                            local.get 7
                            call_indirect (type 2)
                            i32.eqz
                            br_if 0 (;@12;)
                            br 2 (;@10;)
                          end
                        end
                        local.get 3
                        i32.load8_u offset=26
                        local.tee 2
                        i32.const 10
                        local.get 2
                        i32.const 10
                        i32.gt_u
                        select
                        local.set 12
                        local.get 3
                        i32.load8_u offset=27
                        local.tee 14
                        local.get 2
                        local.get 14
                        local.get 2
                        i32.gt_u
                        select
                        local.set 17
                        loop  ;; label = @11
                          local.get 17
                          local.get 2
                          i32.eq
                          br_if 2 (;@9;)
                          local.get 3
                          local.get 2
                          i32.const 1
                          i32.add
                          local.tee 14
                          i32.store8 offset=26
                          local.get 12
                          local.get 2
                          i32.eq
                          br_if 4 (;@7;)
                          local.get 3
                          i32.const 16
                          i32.add
                          local.get 2
                          i32.add
                          local.set 15
                          local.get 14
                          local.set 2
                          local.get 5
                          local.get 15
                          i32.load8_u
                          local.get 7
                          call_indirect (type 2)
                          i32.eqz
                          br_if 0 (;@11;)
                        end
                      end
                      i32.const 1
                      local.set 4
                      br 7 (;@2;)
                    end
                    i32.const 1
                    local.set 2
                    block  ;; label = @9
                      local.get 13
                      i32.const 128
                      i32.lt_u
                      br_if 0 (;@9;)
                      i32.const 2
                      local.set 2
                      local.get 13
                      i32.const 2048
                      i32.lt_u
                      br_if 0 (;@9;)
                      i32.const 3
                      i32.const 4
                      local.get 13
                      i32.const 65536
                      i32.lt_u
                      select
                      local.set 2
                    end
                    local.get 2
                    local.get 10
                    i32.add
                    local.set 2
                  end
                  local.get 10
                  local.get 11
                  i32.sub
                  local.get 9
                  i32.add
                  local.set 10
                  local.get 9
                  local.get 8
                  i32.ne
                  br_if 1 (;@6;)
                  br 3 (;@4;)
                end
              end
              local.get 12
              i32.const 10
              i32.const 1051876
              call $_ZN4core9panicking18panic_bounds_check17h113d0e7204064fb4E
              unreachable
            end
            local.get 0
            local.get 1
            local.get 2
            local.get 10
            i32.const 1049828
            call $_ZN4core3str16slice_error_fail17h8d3faa8d421e4471E
            unreachable
          end
          block  ;; label = @4
            local.get 2
            br_if 0 (;@4;)
            i32.const 0
            local.set 2
            br 1 (;@3;)
          end
          block  ;; label = @4
            block  ;; label = @5
              local.get 2
              local.get 1
              i32.lt_u
              br_if 0 (;@5;)
              local.get 1
              local.get 2
              i32.eq
              br_if 1 (;@4;)
              br 4 (;@1;)
            end
            local.get 0
            local.get 2
            i32.add
            i32.load8_s
            i32.const -65
            i32.le_s
            br_if 3 (;@1;)
          end
          local.get 1
          local.get 2
          i32.sub
          local.set 1
        end
        local.get 5
        local.get 0
        local.get 2
        i32.add
        local.get 1
        local.get 6
        i32.load offset=12
        call_indirect (type 1)
        br_if 0 (;@2;)
        local.get 5
        i32.const 34
        local.get 7
        call_indirect (type 2)
        local.set 4
      end
      local.get 3
      i32.const 32
      i32.add
      global.set $__stack_pointer
      local.get 4
      return
    end
    local.get 0
    local.get 1
    local.get 2
    local.get 1
    i32.const 1049812
    call $_ZN4core3str16slice_error_fail17h8d3faa8d421e4471E
    unreachable)
  (func $_ZN41_$LT$char$u20$as$u20$core..fmt..Debug$GT$3fmt17h10135fc390e609d5E (type 2) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    i32.const 1
    local.set 3
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.load offset=20
        local.tee 4
        i32.const 39
        local.get 1
        i32.const 24
        i32.add
        i32.load
        i32.load offset=16
        local.tee 5
        call_indirect (type 2)
        br_if 0 (;@2;)
        local.get 2
        local.get 0
        i32.load
        i32.const 257
        call $_ZN4core4char7methods22_$LT$impl$u20$char$GT$16escape_debug_ext17h4c316730ec24ddc6E
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            i32.load8_u
            i32.const 128
            i32.ne
            br_if 0 (;@4;)
            local.get 2
            i32.const 8
            i32.add
            local.set 6
            i32.const 128
            local.set 7
            loop  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 7
                  i32.const 255
                  i32.and
                  i32.const 128
                  i32.eq
                  br_if 0 (;@7;)
                  local.get 2
                  i32.load8_u offset=10
                  local.tee 0
                  local.get 2
                  i32.load8_u offset=11
                  i32.ge_u
                  br_if 4 (;@3;)
                  local.get 2
                  local.get 0
                  i32.const 1
                  i32.add
                  i32.store8 offset=10
                  local.get 0
                  i32.const 10
                  i32.ge_u
                  br_if 6 (;@1;)
                  local.get 2
                  local.get 0
                  i32.add
                  i32.load8_u
                  local.set 1
                  br 1 (;@6;)
                end
                i32.const 0
                local.set 7
                local.get 6
                i32.const 0
                i32.store
                local.get 2
                i32.load offset=4
                local.set 1
                local.get 2
                i64.const 0
                i64.store
              end
              local.get 4
              local.get 1
              local.get 5
              call_indirect (type 2)
              i32.eqz
              br_if 0 (;@5;)
              br 3 (;@2;)
            end
          end
          local.get 2
          i32.load8_u offset=10
          local.tee 1
          i32.const 10
          local.get 1
          i32.const 10
          i32.gt_u
          select
          local.set 0
          local.get 2
          i32.load8_u offset=11
          local.tee 7
          local.get 1
          local.get 7
          local.get 1
          i32.gt_u
          select
          local.set 8
          loop  ;; label = @4
            local.get 8
            local.get 1
            i32.eq
            br_if 1 (;@3;)
            local.get 2
            local.get 1
            i32.const 1
            i32.add
            local.tee 7
            i32.store8 offset=10
            local.get 0
            local.get 1
            i32.eq
            br_if 3 (;@1;)
            local.get 2
            local.get 1
            i32.add
            local.set 6
            local.get 7
            local.set 1
            local.get 4
            local.get 6
            i32.load8_u
            local.get 5
            call_indirect (type 2)
            i32.eqz
            br_if 0 (;@4;)
            br 2 (;@2;)
          end
        end
        local.get 4
        i32.const 39
        local.get 5
        call_indirect (type 2)
        local.set 3
      end
      local.get 2
      i32.const 16
      i32.add
      global.set $__stack_pointer
      local.get 3
      return
    end
    local.get 0
    i32.const 10
    i32.const 1051876
    call $_ZN4core9panicking18panic_bounds_check17h113d0e7204064fb4E
    unreachable)
  (func $_ZN4core3str19slice_error_fail_rt17h206dba6f8cfb4122E (type 9) (param i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32)
    global.get $__stack_pointer
    i32.const 112
    i32.sub
    local.tee 5
    global.set $__stack_pointer
    local.get 5
    local.get 3
    i32.store offset=12
    local.get 5
    local.get 2
    i32.store offset=8
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          i32.const 257
          i32.lt_u
          br_if 0 (;@3;)
          i32.const 256
          local.set 6
          block  ;; label = @4
            local.get 0
            i32.load8_s offset=256
            i32.const -65
            i32.gt_s
            br_if 0 (;@4;)
            i32.const 255
            local.set 6
            local.get 0
            i32.load8_s offset=255
            i32.const -65
            i32.gt_s
            br_if 0 (;@4;)
            i32.const 254
            local.set 6
            local.get 0
            i32.load8_s offset=254
            i32.const -65
            i32.gt_s
            br_if 0 (;@4;)
            i32.const 253
            local.set 6
          end
          local.get 0
          local.get 6
          i32.add
          i32.load8_s
          i32.const -65
          i32.le_s
          br_if 1 (;@2;)
          local.get 5
          local.get 6
          i32.store offset=20
          local.get 5
          local.get 0
          i32.store offset=16
          i32.const 5
          local.set 6
          i32.const 1049996
          local.set 7
          br 2 (;@1;)
        end
        local.get 5
        local.get 1
        i32.store offset=20
        local.get 5
        local.get 0
        i32.store offset=16
        i32.const 0
        local.set 6
        i32.const 1049400
        local.set 7
        br 1 (;@1;)
      end
      local.get 0
      local.get 1
      i32.const 0
      local.get 6
      local.get 4
      call $_ZN4core3str16slice_error_fail17h8d3faa8d421e4471E
      unreachable
    end
    local.get 5
    local.get 6
    i32.store offset=28
    local.get 5
    local.get 7
    i32.store offset=24
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 2
              local.get 1
              i32.gt_u
              local.tee 6
              br_if 0 (;@5;)
              local.get 3
              local.get 1
              i32.gt_u
              br_if 0 (;@5;)
              local.get 2
              local.get 3
              i32.gt_u
              br_if 2 (;@3;)
              block  ;; label = @6
                block  ;; label = @7
                  local.get 2
                  i32.eqz
                  br_if 0 (;@7;)
                  block  ;; label = @8
                    local.get 2
                    local.get 1
                    i32.lt_u
                    br_if 0 (;@8;)
                    local.get 2
                    local.get 1
                    i32.eq
                    br_if 1 (;@7;)
                    br 2 (;@6;)
                  end
                  local.get 0
                  local.get 2
                  i32.add
                  i32.load8_s
                  i32.const -64
                  i32.lt_s
                  br_if 1 (;@6;)
                end
                local.get 3
                local.set 2
              end
              local.get 5
              local.get 2
              i32.store offset=32
              local.get 1
              local.set 3
              block  ;; label = @6
                local.get 2
                local.get 1
                i32.ge_u
                br_if 0 (;@6;)
                local.get 2
                i32.const 1
                i32.add
                local.tee 6
                i32.const 0
                local.get 2
                i32.const -3
                i32.add
                local.tee 3
                local.get 3
                local.get 2
                i32.gt_u
                select
                local.tee 3
                i32.lt_u
                br_if 2 (;@4;)
                block  ;; label = @7
                  local.get 3
                  local.get 6
                  i32.eq
                  br_if 0 (;@7;)
                  local.get 0
                  local.get 6
                  i32.add
                  local.get 0
                  local.get 3
                  i32.add
                  local.tee 8
                  i32.sub
                  local.set 6
                  block  ;; label = @8
                    local.get 0
                    local.get 2
                    i32.add
                    local.tee 9
                    i32.load8_s
                    i32.const -65
                    i32.le_s
                    br_if 0 (;@8;)
                    local.get 6
                    i32.const -1
                    i32.add
                    local.set 7
                    br 1 (;@7;)
                  end
                  local.get 3
                  local.get 2
                  i32.eq
                  br_if 0 (;@7;)
                  block  ;; label = @8
                    local.get 9
                    i32.const -1
                    i32.add
                    local.tee 2
                    i32.load8_s
                    i32.const -65
                    i32.le_s
                    br_if 0 (;@8;)
                    local.get 6
                    i32.const -2
                    i32.add
                    local.set 7
                    br 1 (;@7;)
                  end
                  local.get 8
                  local.get 2
                  i32.eq
                  br_if 0 (;@7;)
                  block  ;; label = @8
                    local.get 2
                    i32.const -1
                    i32.add
                    local.tee 2
                    i32.load8_s
                    i32.const -65
                    i32.le_s
                    br_if 0 (;@8;)
                    local.get 6
                    i32.const -3
                    i32.add
                    local.set 7
                    br 1 (;@7;)
                  end
                  local.get 8
                  local.get 2
                  i32.eq
                  br_if 0 (;@7;)
                  block  ;; label = @8
                    local.get 2
                    i32.const -1
                    i32.add
                    local.tee 2
                    i32.load8_s
                    i32.const -65
                    i32.le_s
                    br_if 0 (;@8;)
                    local.get 6
                    i32.const -4
                    i32.add
                    local.set 7
                    br 1 (;@7;)
                  end
                  local.get 8
                  local.get 2
                  i32.eq
                  br_if 0 (;@7;)
                  local.get 6
                  i32.const -5
                  i32.add
                  local.set 7
                end
                local.get 7
                local.get 3
                i32.add
                local.set 3
              end
              local.get 3
              i32.eqz
              br_if 4 (;@1;)
              block  ;; label = @6
                block  ;; label = @7
                  local.get 3
                  local.get 1
                  i32.lt_u
                  br_if 0 (;@7;)
                  local.get 1
                  local.get 3
                  i32.ne
                  br_if 1 (;@6;)
                  br 5 (;@2;)
                end
                local.get 0
                local.get 3
                i32.add
                i32.load8_s
                i32.const -65
                i32.gt_s
                br_if 4 (;@2;)
              end
              local.get 0
              local.get 1
              local.get 3
              local.get 1
              local.get 4
              call $_ZN4core3str16slice_error_fail17h8d3faa8d421e4471E
              unreachable
            end
            local.get 5
            local.get 2
            local.get 3
            local.get 6
            select
            i32.store offset=40
            local.get 5
            i32.const 48
            i32.add
            i32.const 12
            i32.add
            i64.const 3
            i64.store align=4
            local.get 5
            i32.const 92
            i32.add
            i32.const 19
            i32.store
            local.get 5
            i32.const 72
            i32.add
            i32.const 12
            i32.add
            i32.const 19
            i32.store
            local.get 5
            i32.const 3
            i32.store offset=52
            local.get 5
            i32.const 1050196
            i32.store offset=48
            local.get 5
            i32.const 2
            i32.store offset=76
            local.get 5
            local.get 5
            i32.const 72
            i32.add
            i32.store offset=56
            local.get 5
            local.get 5
            i32.const 24
            i32.add
            i32.store offset=88
            local.get 5
            local.get 5
            i32.const 16
            i32.add
            i32.store offset=80
            local.get 5
            local.get 5
            i32.const 40
            i32.add
            i32.store offset=72
            local.get 5
            i32.const 48
            i32.add
            local.get 4
            call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
            unreachable
          end
          local.get 3
          local.get 6
          i32.const 1050248
          call $_ZN4core5slice5index22slice_index_order_fail17h61bd70cc51de790bE
          unreachable
        end
        local.get 5
        i32.const 100
        i32.add
        i32.const 19
        i32.store
        local.get 5
        i32.const 92
        i32.add
        i32.const 19
        i32.store
        local.get 5
        i32.const 72
        i32.add
        i32.const 12
        i32.add
        i32.const 2
        i32.store
        local.get 5
        i32.const 48
        i32.add
        i32.const 12
        i32.add
        i64.const 4
        i64.store align=4
        local.get 5
        i32.const 4
        i32.store offset=52
        local.get 5
        i32.const 1050140
        i32.store offset=48
        local.get 5
        i32.const 2
        i32.store offset=76
        local.get 5
        local.get 5
        i32.const 72
        i32.add
        i32.store offset=56
        local.get 5
        local.get 5
        i32.const 24
        i32.add
        i32.store offset=96
        local.get 5
        local.get 5
        i32.const 16
        i32.add
        i32.store offset=88
        local.get 5
        local.get 5
        i32.const 12
        i32.add
        i32.store offset=80
        local.get 5
        local.get 5
        i32.const 8
        i32.add
        i32.store offset=72
        local.get 5
        i32.const 48
        i32.add
        local.get 4
        call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
        unreachable
      end
      local.get 1
      local.get 3
      i32.sub
      local.set 1
    end
    block  ;; label = @1
      local.get 1
      i32.eqz
      br_if 0 (;@1;)
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              local.get 3
              i32.add
              local.tee 2
              i32.load8_s
              local.tee 1
              i32.const -1
              i32.gt_s
              br_if 0 (;@5;)
              local.get 2
              i32.load8_u offset=1
              i32.const 63
              i32.and
              local.set 0
              local.get 1
              i32.const 31
              i32.and
              local.set 6
              local.get 1
              i32.const -33
              i32.gt_u
              br_if 1 (;@4;)
              local.get 6
              i32.const 6
              i32.shl
              local.get 0
              i32.or
              local.set 2
              br 2 (;@3;)
            end
            local.get 5
            local.get 1
            i32.const 255
            i32.and
            i32.store offset=36
            i32.const 1
            local.set 1
            br 2 (;@2;)
          end
          local.get 0
          i32.const 6
          i32.shl
          local.get 2
          i32.load8_u offset=2
          i32.const 63
          i32.and
          i32.or
          local.set 0
          block  ;; label = @4
            local.get 1
            i32.const -16
            i32.ge_u
            br_if 0 (;@4;)
            local.get 0
            local.get 6
            i32.const 12
            i32.shl
            i32.or
            local.set 2
            br 1 (;@3;)
          end
          local.get 0
          i32.const 6
          i32.shl
          local.get 2
          i32.load8_u offset=3
          i32.const 63
          i32.and
          i32.or
          local.get 6
          i32.const 18
          i32.shl
          i32.const 1835008
          i32.and
          i32.or
          local.tee 2
          i32.const 1114112
          i32.eq
          br_if 2 (;@1;)
        end
        local.get 5
        local.get 2
        i32.store offset=36
        i32.const 1
        local.set 1
        local.get 2
        i32.const 128
        i32.lt_u
        br_if 0 (;@2;)
        i32.const 2
        local.set 1
        local.get 2
        i32.const 2048
        i32.lt_u
        br_if 0 (;@2;)
        i32.const 3
        i32.const 4
        local.get 2
        i32.const 65536
        i32.lt_u
        select
        local.set 1
      end
      local.get 5
      local.get 3
      i32.store offset=40
      local.get 5
      local.get 1
      local.get 3
      i32.add
      i32.store offset=44
      local.get 5
      i32.const 48
      i32.add
      i32.const 12
      i32.add
      i64.const 5
      i64.store align=4
      local.get 5
      i32.const 108
      i32.add
      i32.const 19
      i32.store
      local.get 5
      i32.const 100
      i32.add
      i32.const 19
      i32.store
      local.get 5
      i32.const 92
      i32.add
      i32.const 20
      i32.store
      local.get 5
      i32.const 72
      i32.add
      i32.const 12
      i32.add
      i32.const 21
      i32.store
      local.get 5
      i32.const 5
      i32.store offset=52
      local.get 5
      i32.const 1050064
      i32.store offset=48
      local.get 5
      i32.const 2
      i32.store offset=76
      local.get 5
      local.get 5
      i32.const 72
      i32.add
      i32.store offset=56
      local.get 5
      local.get 5
      i32.const 24
      i32.add
      i32.store offset=104
      local.get 5
      local.get 5
      i32.const 16
      i32.add
      i32.store offset=96
      local.get 5
      local.get 5
      i32.const 40
      i32.add
      i32.store offset=88
      local.get 5
      local.get 5
      i32.const 36
      i32.add
      i32.store offset=80
      local.get 5
      local.get 5
      i32.const 32
      i32.add
      i32.store offset=72
      local.get 5
      i32.const 48
      i32.add
      local.get 4
      call $_ZN4core9panicking9panic_fmt17h11b45930005ad65aE
      unreachable
    end
    i32.const 1049400
    i32.const 43
    local.get 4
    call $_ZN4core9panicking5panic17heed2792a4659ea4dE
    unreachable)
  (func $_ZN4core7unicode9printable5check17hb69480130f9999f2E (type 13) (param i32 i32 i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    i32.const 1
    local.set 7
    block  ;; label = @1
      block  ;; label = @2
        local.get 2
        i32.eqz
        br_if 0 (;@2;)
        local.get 1
        local.get 2
        i32.const 1
        i32.shl
        i32.add
        local.set 8
        local.get 0
        i32.const 65280
        i32.and
        i32.const 8
        i32.shr_u
        local.set 9
        i32.const 0
        local.set 10
        local.get 0
        i32.const 255
        i32.and
        local.set 11
        loop  ;; label = @3
          local.get 1
          i32.const 2
          i32.add
          local.set 12
          local.get 10
          local.get 1
          i32.load8_u offset=1
          local.tee 2
          i32.add
          local.set 13
          block  ;; label = @4
            local.get 1
            i32.load8_u
            local.tee 1
            local.get 9
            i32.eq
            br_if 0 (;@4;)
            local.get 1
            local.get 9
            i32.gt_u
            br_if 2 (;@2;)
            local.get 13
            local.set 10
            local.get 12
            local.set 1
            local.get 12
            local.get 8
            i32.eq
            br_if 2 (;@2;)
            br 1 (;@3;)
          end
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 13
                local.get 10
                i32.lt_u
                br_if 0 (;@6;)
                local.get 13
                local.get 4
                i32.gt_u
                br_if 1 (;@5;)
                local.get 3
                local.get 10
                i32.add
                local.set 1
                loop  ;; label = @7
                  local.get 2
                  i32.eqz
                  br_if 3 (;@4;)
                  local.get 2
                  i32.const -1
                  i32.add
                  local.set 2
                  local.get 1
                  i32.load8_u
                  local.set 10
                  local.get 1
                  i32.const 1
                  i32.add
                  local.set 1
                  local.get 10
                  local.get 11
                  i32.ne
                  br_if 0 (;@7;)
                end
                i32.const 0
                local.set 7
                br 5 (;@1;)
              end
              local.get 10
              local.get 13
              i32.const 1050320
              call $_ZN4core5slice5index22slice_index_order_fail17h61bd70cc51de790bE
              unreachable
            end
            local.get 13
            local.get 4
            i32.const 1050320
            call $_ZN4core5slice5index24slice_end_index_len_fail17hcd7f8e8288c8efc1E
            unreachable
          end
          local.get 13
          local.set 10
          local.get 12
          local.set 1
          local.get 12
          local.get 8
          i32.ne
          br_if 0 (;@3;)
        end
      end
      local.get 6
      i32.eqz
      br_if 0 (;@1;)
      local.get 5
      local.get 6
      i32.add
      local.set 11
      local.get 0
      i32.const 65535
      i32.and
      local.set 1
      i32.const 1
      local.set 7
      loop  ;; label = @2
        local.get 5
        i32.const 1
        i32.add
        local.set 10
        block  ;; label = @3
          block  ;; label = @4
            local.get 5
            i32.load8_u
            local.tee 2
            i32.extend8_s
            local.tee 13
            i32.const 0
            i32.lt_s
            br_if 0 (;@4;)
            local.get 10
            local.set 5
            br 1 (;@3;)
          end
          block  ;; label = @4
            local.get 10
            local.get 11
            i32.eq
            br_if 0 (;@4;)
            local.get 13
            i32.const 127
            i32.and
            i32.const 8
            i32.shl
            local.get 5
            i32.load8_u offset=1
            i32.or
            local.set 2
            local.get 5
            i32.const 2
            i32.add
            local.set 5
            br 1 (;@3;)
          end
          i32.const 1049400
          i32.const 43
          i32.const 1050304
          call $_ZN4core9panicking5panic17heed2792a4659ea4dE
          unreachable
        end
        local.get 1
        local.get 2
        i32.sub
        local.tee 1
        i32.const 0
        i32.lt_s
        br_if 1 (;@1;)
        local.get 7
        i32.const 1
        i32.xor
        local.set 7
        local.get 5
        local.get 11
        i32.ne
        br_if 0 (;@2;)
      end
    end
    local.get 7
    i32.const 1
    i32.and)
  (func $_ZN4core3fmt3num3imp7fmt_u6417h01c3e5927f09eee1E (type 14) (param i64 i32 i32) (result i32)
    (local i32 i32 i64 i32 i32 i32)
    global.get $__stack_pointer
    i32.const 48
    i32.sub
    local.tee 3
    global.set $__stack_pointer
    i32.const 39
    local.set 4
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i64.const 10000
        i64.ge_u
        br_if 0 (;@2;)
        local.get 0
        local.set 5
        br 1 (;@1;)
      end
      i32.const 39
      local.set 4
      loop  ;; label = @2
        local.get 3
        i32.const 9
        i32.add
        local.get 4
        i32.add
        local.tee 6
        i32.const -4
        i32.add
        local.get 0
        local.get 0
        i64.const 10000
        i64.div_u
        local.tee 5
        i64.const 10000
        i64.mul
        i64.sub
        i32.wrap_i64
        local.tee 7
        i32.const 65535
        i32.and
        i32.const 100
        i32.div_u
        local.tee 8
        i32.const 1
        i32.shl
        i32.const 1049612
        i32.add
        i32.load16_u align=1
        i32.store16 align=1
        local.get 6
        i32.const -2
        i32.add
        local.get 7
        local.get 8
        i32.const 100
        i32.mul
        i32.sub
        i32.const 65535
        i32.and
        i32.const 1
        i32.shl
        i32.const 1049612
        i32.add
        i32.load16_u align=1
        i32.store16 align=1
        local.get 4
        i32.const -4
        i32.add
        local.set 4
        local.get 0
        i64.const 99999999
        i64.gt_u
        local.set 6
        local.get 5
        local.set 0
        local.get 6
        br_if 0 (;@2;)
      end
    end
    block  ;; label = @1
      local.get 5
      i32.wrap_i64
      local.tee 6
      i32.const 99
      i32.le_u
      br_if 0 (;@1;)
      local.get 3
      i32.const 9
      i32.add
      local.get 4
      i32.const -2
      i32.add
      local.tee 4
      i32.add
      local.get 5
      i32.wrap_i64
      local.tee 6
      local.get 6
      i32.const 65535
      i32.and
      i32.const 100
      i32.div_u
      local.tee 6
      i32.const 100
      i32.mul
      i32.sub
      i32.const 65535
      i32.and
      i32.const 1
      i32.shl
      i32.const 1049612
      i32.add
      i32.load16_u align=1
      i32.store16 align=1
    end
    block  ;; label = @1
      block  ;; label = @2
        local.get 6
        i32.const 10
        i32.lt_u
        br_if 0 (;@2;)
        local.get 3
        i32.const 9
        i32.add
        local.get 4
        i32.const -2
        i32.add
        local.tee 4
        i32.add
        local.get 6
        i32.const 1
        i32.shl
        i32.const 1049612
        i32.add
        i32.load16_u align=1
        i32.store16 align=1
        br 1 (;@1;)
      end
      local.get 3
      i32.const 9
      i32.add
      local.get 4
      i32.const -1
      i32.add
      local.tee 4
      i32.add
      local.get 6
      i32.const 48
      i32.add
      i32.store8
    end
    local.get 2
    local.get 1
    i32.const 1049400
    i32.const 0
    local.get 3
    i32.const 9
    i32.add
    local.get 4
    i32.add
    i32.const 39
    local.get 4
    i32.sub
    call $_ZN4core3fmt9Formatter12pad_integral17h7f32912d39031beeE
    local.set 4
    local.get 3
    i32.const 48
    i32.add
    global.set $__stack_pointer
    local.get 4)
  (func $_ZN17compiler_builtins3mem6memcpy17he9dbc8f12c6c651eE (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 2
        i32.const 15
        i32.gt_u
        br_if 0 (;@2;)
        local.get 0
        local.set 3
        br 1 (;@1;)
      end
      local.get 0
      i32.const 0
      local.get 0
      i32.sub
      i32.const 3
      i32.and
      local.tee 4
      i32.add
      local.set 5
      block  ;; label = @2
        local.get 4
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        local.set 3
        local.get 1
        local.set 6
        loop  ;; label = @3
          local.get 3
          local.get 6
          i32.load8_u
          i32.store8
          local.get 6
          i32.const 1
          i32.add
          local.set 6
          local.get 3
          i32.const 1
          i32.add
          local.tee 3
          local.get 5
          i32.lt_u
          br_if 0 (;@3;)
        end
      end
      local.get 5
      local.get 2
      local.get 4
      i32.sub
      local.tee 7
      i32.const -4
      i32.and
      local.tee 8
      i32.add
      local.set 3
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          local.get 4
          i32.add
          local.tee 9
          i32.const 3
          i32.and
          i32.eqz
          br_if 0 (;@3;)
          local.get 8
          i32.const 1
          i32.lt_s
          br_if 1 (;@2;)
          local.get 9
          i32.const 3
          i32.shl
          local.tee 6
          i32.const 24
          i32.and
          local.set 2
          local.get 9
          i32.const -4
          i32.and
          local.tee 10
          i32.const 4
          i32.add
          local.set 1
          i32.const 0
          local.get 6
          i32.sub
          i32.const 24
          i32.and
          local.set 4
          local.get 10
          i32.load
          local.set 6
          loop  ;; label = @4
            local.get 5
            local.get 6
            local.get 2
            i32.shr_u
            local.get 1
            i32.load
            local.tee 6
            local.get 4
            i32.shl
            i32.or
            i32.store
            local.get 1
            i32.const 4
            i32.add
            local.set 1
            local.get 5
            i32.const 4
            i32.add
            local.tee 5
            local.get 3
            i32.lt_u
            br_if 0 (;@4;)
            br 2 (;@2;)
          end
        end
        local.get 8
        i32.const 1
        i32.lt_s
        br_if 0 (;@2;)
        local.get 9
        local.set 1
        loop  ;; label = @3
          local.get 5
          local.get 1
          i32.load
          i32.store
          local.get 1
          i32.const 4
          i32.add
          local.set 1
          local.get 5
          i32.const 4
          i32.add
          local.tee 5
          local.get 3
          i32.lt_u
          br_if 0 (;@3;)
        end
      end
      local.get 7
      i32.const 3
      i32.and
      local.set 2
      local.get 9
      local.get 8
      i32.add
      local.set 1
    end
    block  ;; label = @1
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 3
      local.get 2
      i32.add
      local.set 5
      loop  ;; label = @2
        local.get 3
        local.get 1
        i32.load8_u
        i32.store8
        local.get 1
        i32.const 1
        i32.add
        local.set 1
        local.get 3
        i32.const 1
        i32.add
        local.tee 3
        local.get 5
        i32.lt_u
        br_if 0 (;@2;)
      end
    end
    local.get 0)
  (func $_ZN17compiler_builtins3mem6memset17h3bc0a4bf11807019E (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 2
        i32.const 15
        i32.gt_u
        br_if 0 (;@2;)
        local.get 0
        local.set 3
        br 1 (;@1;)
      end
      local.get 0
      i32.const 0
      local.get 0
      i32.sub
      i32.const 3
      i32.and
      local.tee 4
      i32.add
      local.set 5
      block  ;; label = @2
        local.get 4
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        local.set 3
        loop  ;; label = @3
          local.get 3
          local.get 1
          i32.store8
          local.get 3
          i32.const 1
          i32.add
          local.tee 3
          local.get 5
          i32.lt_u
          br_if 0 (;@3;)
        end
      end
      local.get 5
      local.get 2
      local.get 4
      i32.sub
      local.tee 4
      i32.const -4
      i32.and
      local.tee 2
      i32.add
      local.set 3
      block  ;; label = @2
        local.get 2
        i32.const 1
        i32.lt_s
        br_if 0 (;@2;)
        local.get 1
        i32.const 255
        i32.and
        i32.const 16843009
        i32.mul
        local.set 2
        loop  ;; label = @3
          local.get 5
          local.get 2
          i32.store
          local.get 5
          i32.const 4
          i32.add
          local.tee 5
          local.get 3
          i32.lt_u
          br_if 0 (;@3;)
        end
      end
      local.get 4
      i32.const 3
      i32.and
      local.set 2
    end
    block  ;; label = @1
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 3
      local.get 2
      i32.add
      local.set 5
      loop  ;; label = @2
        local.get 3
        local.get 1
        i32.store8
        local.get 3
        i32.const 1
        i32.add
        local.tee 3
        local.get 5
        i32.lt_u
        br_if 0 (;@2;)
      end
    end
    local.get 0)
  (func $_ZN17compiler_builtins3mem6memcmp17hdb9fb20b3e97dfc5E (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32)
    i32.const 0
    local.set 3
    block  ;; label = @1
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      block  ;; label = @2
        loop  ;; label = @3
          local.get 0
          i32.load8_u
          local.tee 4
          local.get 1
          i32.load8_u
          local.tee 5
          i32.ne
          br_if 1 (;@2;)
          local.get 0
          i32.const 1
          i32.add
          local.set 0
          local.get 1
          i32.const 1
          i32.add
          local.set 1
          local.get 2
          i32.const -1
          i32.add
          local.tee 2
          i32.eqz
          br_if 2 (;@1;)
          br 0 (;@3;)
        end
      end
      local.get 4
      local.get 5
      i32.sub
      local.set 3
    end
    local.get 3)
  (func $memcpy (type 1) (param i32 i32 i32) (result i32)
    local.get 0
    local.get 1
    local.get 2
    call $_ZN17compiler_builtins3mem6memcpy17he9dbc8f12c6c651eE)
  (func $memset (type 1) (param i32 i32 i32) (result i32)
    local.get 0
    local.get 1
    local.get 2
    call $_ZN17compiler_builtins3mem6memset17h3bc0a4bf11807019E)
  (func $memcmp (type 1) (param i32 i32 i32) (result i32)
    local.get 0
    local.get 1
    local.get 2
    call $_ZN17compiler_builtins3mem6memcmp17hdb9fb20b3e97dfc5E)
  (table (;0;) 24 24 funcref)
  (memory (;0;) 17)
  (global $__stack_pointer (mut i32) (i32.const 1048576))
  (global (;1;) i32 (i32.const 1053237))
  (global (;2;) i32 (i32.const 1053248))
  (export "memory" (memory 0))
  (export "alloc_memory" (func $alloc_memory))
  (export "dealloc_memory" (func $dealloc_memory))
  (export "function_call_js_with_string" (func $function_call_js_with_string))
  (export "function_take_string_reference" (func $function_take_string_reference))
  (export "__data_end" (global 1))
  (export "__heap_base" (global 2))
  (elem (;0;) (i32.const 1) func $_ZN42_$LT$$RF$T$u20$as$u20$core..fmt..Debug$GT$3fmt17h303d848590e5ca97E $_ZN4core3fmt3num3imp52_$LT$impl$u20$core..fmt..Display$u20$for$u20$u32$GT$3fmt17h2b6c5f9cccdc9b6dE $_ZN3std5alloc24default_alloc_error_hook17h3fb6eb051cd21889E $_ZN4core3ptr100drop_in_place$LT$$RF$mut$u20$std..io..Write..write_fmt..Adapter$LT$alloc..vec..Vec$LT$u8$GT$$GT$$GT$17h79c6a2d095fff53dE $_ZN50_$LT$$RF$mut$u20$W$u20$as$u20$core..fmt..Write$GT$9write_str17h1d23482077b86a21E $_ZN50_$LT$$RF$mut$u20$W$u20$as$u20$core..fmt..Write$GT$10write_char17hc19cd3a62fd9b3a5E $_ZN50_$LT$$RF$mut$u20$W$u20$as$u20$core..fmt..Write$GT$9write_fmt17hc0328aa8dce798ebE $_ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$17hd1fd0dab68cf6b27E $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17h48836f8f70f802fdE $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17h3f0023a0be2ed8e7E $_ZN93_$LT$std..panicking..begin_panic_handler..StrPanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$8take_box17ha7fd4a6b92995084E $_ZN93_$LT$std..panicking..begin_panic_handler..StrPanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$3get17h6e5fb3beae42e74eE $_ZN4core3ptr70drop_in_place$LT$std..panicking..begin_panic_handler..PanicPayload$GT$17hb278bce6ff851616E $_ZN90_$LT$std..panicking..begin_panic_handler..PanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$8take_box17h7f0e9beddbf9851aE $_ZN90_$LT$std..panicking..begin_panic_handler..PanicPayload$u20$as$u20$core..panic..BoxMeUp$GT$3get17hb74c4b52802455cfE $_ZN4core3ptr29drop_in_place$LT$$LP$$RP$$GT$17h1541364658a4c3e0E $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17h0e919b83d9294a5fE $_ZN4core3ops8function6FnOnce9call_once17h03cd4205c3ed02abE $_ZN44_$LT$$RF$T$u20$as$u20$core..fmt..Display$GT$3fmt17h0192f98da0136ea1E $_ZN71_$LT$core..ops..range..Range$LT$Idx$GT$$u20$as$u20$core..fmt..Debug$GT$3fmt17h42757caa5af7fe94E $_ZN41_$LT$char$u20$as$u20$core..fmt..Debug$GT$3fmt17h10135fc390e609d5E $_ZN4core3ptr37drop_in_place$LT$core..fmt..Error$GT$17hdb2ce4668b5ca4d5E $_ZN36_$LT$T$u20$as$u20$core..any..Any$GT$7type_id17hfb7c746da5264eccE)
  (data $.rodata (i32.const 1048576) "/rustc/474709a9a2a74a8bcf0055fadb335d0ca0d2d939/library/core/src/alloc/layout.rs\00\00\10\00P\00\00\00\bf\01\00\00)\00\00\00attempt to divide by zero[RUST Failed]:\00y\00\10\00\0e\00\00\00alloc memory failed\00\90\00\10\00\13\00\00\00JSbridge/examples/string_passing/src/lib.rs\00\ac\00\10\00+\00\00\00\1a\00\00\00\05\00\00\00dealloc memory failed\00\00\00\e8\00\10\00\15\00\00\00\ac\00\10\00+\00\00\00%\00\00\00\05\00\00\00\00\00\00\00\00\00\00\00string-value-from-jsTest string from rustinvalid args\00\00\00I\01\10\00\0c\00\00\00/rustc/474709a9a2a74a8bcf0055fadb335d0ca0d2d939/library/core/src/fmt/mod.rs\00`\01\10\00K\00\00\005\01\00\00\0d\00\00\00\04\00\00\00\04\00\00\00\04\00\00\00\05\00\00\00\06\00\00\00\07\00\00\00called `Option::unwrap()` on a `None` valuememory allocation of  bytes failed\00\00\00\ff\01\10\00\15\00\00\00\14\02\10\00\0d\00\00\00library/std/src/alloc.rs4\02\10\00\18\00\00\00T\01\00\00\09\00\00\00library/std/src/panicking.rs\5c\02\10\00\1c\00\00\00g\02\00\00\1f\00\00\00\5c\02\10\00\1c\00\00\00h\02\00\00\1e\00\00\00\08\00\00\00\0c\00\00\00\04\00\00\00\09\00\00\00\04\00\00\00\08\00\00\00\04\00\00\00\0a\00\00\00\04\00\00\00\08\00\00\00\04\00\00\00\0b\00\00\00\0c\00\00\00\0d\00\00\00\10\00\00\00\04\00\00\00\0e\00\00\00\0f\00\00\00\10\00\00\00\00\00\00\00\01\00\00\00\11\00\00\00library/alloc/src/raw_vec.rscapacity overflow\00\00\00\0c\03\10\00\11\00\00\00\f0\02\10\00\1c\00\00\00\16\02\00\00\05\00\00\00called `Option::unwrap()` on a `None` valuelibrary/core/src/fmt/mod.rs..~\03\10\00\02\00\00\00\16\00\00\00\00\00\00\00\01\00\00\00\17\00\00\00index out of bounds: the len is  but the index is \00\00\98\03\10\00 \00\00\00\b8\03\10\00\12\00\00\00`0xlibrary/core/src/fmt/num.rs\00\00\df\03\10\00\1b\00\00\00i\00\00\00\14\00\00\0000010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899c\03\10\00\1b\00\00\00\1b\09\00\00\16\00\00\00c\03\10\00\1b\00\00\00\14\09\00\00\1e\00\00\00range start index  out of range for slice of length \f4\04\10\00\12\00\00\00\06\05\10\00\22\00\00\00range end index 8\05\10\00\10\00\00\00\06\05\10\00\22\00\00\00slice index starts at  but ends at \00X\05\10\00\16\00\00\00n\05\10\00\0d\00\00\00[...]byte index  is not a char boundary; it is inside  (bytes ) of `\91\05\10\00\0b\00\00\00\9c\05\10\00&\00\00\00\c2\05\10\00\08\00\00\00\ca\05\10\00\06\00\00\00\dc\03\10\00\01\00\00\00begin <= end ( <= ) when slicing `\00\00\f8\05\10\00\0e\00\00\00\06\06\10\00\04\00\00\00\0a\06\10\00\10\00\00\00\dc\03\10\00\01\00\00\00 is out of bounds of `\00\00\91\05\10\00\0b\00\00\00<\06\10\00\16\00\00\00\dc\03\10\00\01\00\00\00library/core/src/str/mod.rs\00l\06\10\00\1b\00\00\00\03\01\00\00\1d\00\00\00library/core/src/unicode/printable.rs\00\00\00\98\06\10\00%\00\00\00\1a\00\00\006\00\00\00\98\06\10\00%\00\00\00\0a\00\00\00\1c\00\00\00\00\06\01\01\03\01\04\02\05\07\07\02\08\08\09\02\0a\05\0b\02\0e\04\10\01\11\02\12\05\13\11\14\01\15\02\17\02\19\0d\1c\05\1d\08\1f\01$\01j\04k\02\af\03\b1\02\bc\02\cf\02\d1\02\d4\0c\d5\09\d6\02\d7\02\da\01\e0\05\e1\02\e7\04\e8\02\ee \f0\04\f8\02\fa\03\fb\01\0c';>NO\8f\9e\9e\9f{\8b\93\96\a2\b2\ba\86\b1\06\07\096=>V\f3\d0\d1\04\14\1867VW\7f\aa\ae\af\bd5\e0\12\87\89\8e\9e\04\0d\0e\11\12)14:EFIJNOde\5c\b6\b7\1b\1c\07\08\0a\0b\14\1769:\a8\a9\d8\d9\097\90\91\a8\07\0a;>fi\8f\92\11o_\bf\ee\efZb\f4\fc\ffST\9a\9b./'(U\9d\a0\a1\a3\a4\a7\a8\ad\ba\bc\c4\06\0b\0c\15\1d:?EQ\a6\a7\cc\cd\a0\07\19\1a\22%>?\e7\ec\ef\ff\c5\c6\04 #%&(38:HJLPSUVXZ\5c^`cefksx}\7f\8a\a4\aa\af\b0\c0\d0\ae\afno\be\93^\22{\05\03\04-\03f\03\01/.\80\82\1d\031\0f\1c\04$\09\1e\05+\05D\04\0e*\80\aa\06$\04$\04(\084\0bNC\817\09\16\0a\08\18;E9\03c\08\090\16\05!\03\1b\05\01@8\04K\05/\04\0a\07\09\07@ '\04\0c\096\03:\05\1a\07\04\0c\07PI73\0d3\07.\08\0a\81&RK+\08*\16\1a&\1c\14\17\09N\04$\09D\0d\19\07\0a\06H\08'\09u\0bB>*\06;\05\0a\06Q\06\01\05\10\03\05\80\8bb\1eH\08\0a\80\a6^\22E\0b\0a\06\0d\13:\06\0a6,\04\17\80\b9<dS\0cH\09\0aFE\1bH\08S\0dI\07\0a\80\f6F\0a\1d\03GI7\03\0e\08\0a\069\07\0a\816\19\07;\03\1cV\01\0f2\0d\83\9bfu\0b\80\c4\8aLc\0d\840\10\16\8f\aa\82G\a1\b9\829\07*\04\5c\06&\0aF\0a(\05\13\82\b0[eK\049\07\11@\05\0b\02\0e\97\f8\08\84\d6*\09\a2\e7\813\0f\01\1d\06\0e\04\08\81\8c\89\04k\05\0d\03\09\07\10\92`G\09t<\80\f6\0as\08p\15Fz\14\0c\14\0cW\09\19\80\87\81G\03\85B\0f\15\84P\1f\06\06\80\d5+\05>!\01p-\03\1a\04\02\81@\1f\11:\05\01\81\d0*\82\e6\80\f7)L\04\0a\04\02\83\11DL=\80\c2<\06\01\04U\05\1b4\02\81\0e,\04d\0cV\0a\80\ae8\1d\0d,\04\09\07\02\0e\06\80\9a\83\d8\04\11\03\0d\03w\04_\06\0c\04\01\0f\0c\048\08\0a\06(\08\22N\81T\0c\1d\03\09\076\08\0e\04\09\07\09\07\80\cb%\0a\84\06\00\01\03\05\05\06\06\02\07\06\08\07\09\11\0a\1c\0b\19\0c\1a\0d\10\0e\0c\0f\04\10\03\12\12\13\09\16\01\17\04\18\01\19\03\1a\07\1b\01\1c\02\1f\16 \03+\03-\0b.\010\031\022\01\a7\02\a9\02\aa\04\ab\08\fa\02\fb\05\fd\02\fe\03\ff\09\adxy\8b\8d\a20WX\8b\8c\90\1c\dd\0e\0fKL\fb\fc./?\5c]_\e2\84\8d\8e\91\92\a9\b1\ba\bb\c5\c6\c9\ca\de\e4\e5\ff\00\04\11\12)147:;=IJ]\84\8e\92\a9\b1\b4\ba\bb\c6\ca\ce\cf\e4\e5\00\04\0d\0e\11\12)14:;EFIJ^de\84\91\9b\9d\c9\ce\cf\0d\11):;EIW[\5c^_de\8d\91\a9\b4\ba\bb\c5\c9\df\e4\e5\f0\0d\11EIde\80\84\b2\bc\be\bf\d5\d7\f0\f1\83\85\8b\a4\a6\be\bf\c5\c7\cf\da\dbH\98\bd\cd\c6\ce\cfINOWY^_\89\8e\8f\b1\b6\b7\bf\c1\c6\c7\d7\11\16\17[\5c\f6\f7\fe\ff\80mq\de\df\0e\1fno\1c\1d_}~\ae\af\7f\bb\bc\16\17\1e\1fFGNOXZ\5c^~\7f\b5\c5\d4\d5\dc\f0\f1\f5rs\8ftu\96&./\a7\af\b7\bf\c7\cf\d7\df\9a@\97\980\8f\1f\d2\d4\ce\ffNOZ[\07\08\0f\10'/\ee\efno7=?BE\90\91Sgu\c8\c9\d0\d1\d8\d9\e7\fe\ff\00 _\22\82\df\04\82D\08\1b\04\06\11\81\ac\0e\80\ab\05\1f\09\81\1b\03\19\08\01\04/\044\04\07\03\01\07\06\07\11\0aP\0f\12\07U\07\03\04\1c\0a\09\03\08\03\07\03\02\03\03\03\0c\04\05\03\0b\06\01\0e\15\05N\07\1b\07W\07\02\06\17\0cP\04C\03-\03\01\04\11\06\0f\0c:\04\1d%_ m\04j%\80\c8\05\82\b0\03\1a\06\82\fd\03Y\07\16\09\18\09\14\0c\14\0cj\06\0a\06\1a\06Y\07+\05F\0a,\04\0c\04\01\031\0b,\04\1a\06\0b\03\80\ac\06\0a\06/1M\03\80\a4\08<\03\0f\03<\078\08+\05\82\ff\11\18\08/\11-\03!\0f!\0f\80\8c\04\82\97\19\0b\15\88\94\05/\05;\07\02\0e\18\09\80\be\22t\0c\80\d6\1a\0c\05\80\ff\05\80\df\0c\f2\9d\037\09\81\5c\14\80\b8\08\80\cb\05\0a\18;\03\0a\068\08F\08\0c\06t\0b\1e\03Z\04Y\09\80\83\18\1c\0a\16\09L\04\80\8a\06\ab\a4\0c\17\041\a1\04\81\da&\07\0c\05\05\80\a6\10\81\f5\07\01 *\06L\04\80\8d\04\80\be\03\1b\03\0f\0dlibrary/core/src/unicode/unicode_data.rs\5c\0c\10\00(\00\00\00P\00\00\00(\00\00\00\5c\0c\10\00(\00\00\00\5c\00\00\00\16\00\00\000123456789abcdeflibrary/core/src/escape.rs\00\00\b4\0c\10\00\1a\00\00\004\00\00\00\05\00\00\00\5cu{\00\b4\0c\10\00\1a\00\00\00b\00\00\00#\00\00\00\00\03\00\00\83\04 \00\91\05`\00]\13\a0\00\12\17 \1f\0c `\1f\ef,\a0+*0 ,o\a6\e0,\02\a8`-\1e\fb`.\00\fe 6\9e\ff`6\fd\01\e16\01\0a!7$\0d\e17\ab\0ea9/\18\a190\1caH\f3\1e\a1L@4aP\f0j\a1QOo!R\9d\bc\a1R\00\cfaSe\d1\a1S\00\da!T\00\e0\e1U\ae\e2aW\ec\e4!Y\d0\e8\a1Y \00\eeY\f0\01\7fZ\00p\00\07\00-\01\01\01\02\01\02\01\01H\0b0\15\10\01e\07\02\06\02\02\01\04#\01\1e\1b[\0b:\09\09\01\18\04\01\09\01\03\01\05+\03<\08*\18\01 7\01\01\01\04\08\04\01\03\07\0a\02\1d\01:\01\01\01\02\04\08\01\09\01\0a\02\1a\01\02\029\01\04\02\04\02\02\03\03\01\1e\02\03\01\0b\029\01\04\05\01\02\04\01\14\02\16\06\01\01:\01\01\02\01\04\08\01\07\03\0a\02\1e\01;\01\01\01\0c\01\09\01(\01\03\017\01\01\03\05\03\01\04\07\02\0b\02\1d\01:\01\02\01\02\01\03\01\05\02\07\02\0b\02\1c\029\02\01\01\02\04\08\01\09\01\0a\02\1d\01H\01\04\01\02\03\01\01\08\01Q\01\02\07\0c\08b\01\02\09\0b\07I\02\1b\01\01\01\01\017\0e\01\05\01\02\05\0b\01$\09\01f\04\01\06\01\02\02\02\19\02\04\03\10\04\0d\01\02\02\06\01\0f\01\00\03\00\03\1d\02\1e\02\1e\02@\02\01\07\08\01\02\0b\09\01-\03\01\01u\02\22\01v\03\04\02\09\01\06\03\db\02\02\01:\01\01\07\01\01\01\01\02\08\06\0a\02\010\1f1\040\07\01\01\05\01(\09\0c\02 \04\02\02\01\038\01\01\02\03\01\01\03:\08\02\02\98\03\01\0d\01\07\04\01\06\01\03\02\c6@\00\01\c3!\00\03\8d\01` \00\06i\02\00\04\01\0a \02P\02\00\01\03\01\04\01\19\02\05\01\97\02\1a\12\0d\01&\08\19\0b.\030\01\02\04\02\02'\01C\06\02\02\02\02\0c\01\08\01/\013\01\01\03\02\02\05\02\01\01*\02\08\01\ee\01\02\01\04\01\00\01\00\10\10\10\00\02\00\01\e2\01\95\05\00\03\01\02\05\04(\03\04\01\a5\02\00\04\00\02P\03F\0b1\04{\016\0f)\01\02\02\0a\031\04\02\02\07\01=\03$\05\01\08>\01\0c\024\09\0a\04\02\01_\03\02\01\01\02\06\01\02\01\9d\01\03\08\15\029\02\01\01\01\01\16\01\0e\07\03\05\c3\08\02\03\01\01\17\01Q\01\02\06\01\01\02\01\01\02\01\02\eb\01\02\04\06\02\01\02\1b\02U\08\02\01\01\02j\01\01\01\02\06\01\01e\03\02\04\01\05\00\09\01\02\f5\01\0a\02\01\01\04\01\90\04\02\02\04\01 \0a(\06\02\04\08\01\09\06\02\03.\0d\01\02\00\07\01\06\01\01R\16\02\07\01\02\01\02z\06\03\01\01\02\01\07\01\01H\02\03\01\01\01\00\02\0b\024\05\05\01\01\01\00\01\06\0f\00\05;\07\00\01?\04Q\01\00\02\00.\02\17\00\01\01\03\04\05\08\08\02\07\1e\04\94\03\007\042\08\01\0e\01\16\05\01\0f\00\07\01\11\02\07\01\02\01\05d\01\a0\07\00\01=\04\00\04\00\07m\07\00`\80\f0\00"))
