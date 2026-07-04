public function login(Request $request)
    {
        $email = $request->email;
        $password = $request->password;

        $user = DB::table('users')
            ->where('email', $email)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 401);
        }

        if (!Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    public function logout()
    {
        return response()->json([
            'success' => true,
            'message' => 'Logged out'
        ]);
    }
