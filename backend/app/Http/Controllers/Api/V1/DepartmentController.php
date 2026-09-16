<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    /**
     * GET /api/v1/departments
     */
    public function index(): JsonResponse
    {
        $departments = Department::query()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $departments,
        ]);
    }

    /**
     * POST /api/v1/departments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'unique:departments,name',
            ],
        ]);

        $department = Department::create($validated);

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => $department,
        ], Response::HTTP_CREATED);
    }

    /**
     * PATCH /api/v1/departments/{department}
     */
    public function update(
        Request $request,
        Department $department
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('departments', 'name')
                    ->ignore($department->id),
            ],
        ]);

        $department->update($validated);

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => $department->fresh(),
        ]);
    }

    /**
     * DELETE /api/v1/departments/{department}
     */
    public function destroy(Department $department): JsonResponse
    {
        if ($department->files()->exists()) {
            return response()->json([
                'message' => 'Department cannot be deleted because it is currently used by files.',
            ], Response::HTTP_CONFLICT);
        }

        $department->delete();

        return response()->json([
            'message' => 'Department deleted successfully.',
        ]);
    }
}