<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class FolderController extends Controller
{
    /**
     * GET /api/v1/folders
     *
     * Display the folder hierarchy.
     */
    public function index(): JsonResponse
    {
        $folders = Folder::whereNull('parent_id')
            ->with([
                'children',
                'files',
            ])
            ->get();

        return response()->json([
            'data' => $this->buildTree($folders),
        ]);
    }

    /**
     * POST /api/v1/folders
     *
     * Create a new folder.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'parentId' => [
                'nullable',
                'integer',
                'exists:folders,id',
            ],
        ]);

        $folder = Folder::create([
            'name' => $validated['name'],
            'parent_id' => $validated['parentId'] ?? null,
        ]);

        return response()->json([
            'message' => 'Folder created successfully.',
            'data' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'parentId' => $folder->parent_id,
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * GET /api/v1/folders/{id}
     *
     * Display folder detail.
     */
    public function show(string $id): JsonResponse
    {
        $folder = Folder::with([
            'parent',
            'children',
            'files',
        ])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'parent' => $folder->parent
                    ? [
                        'id' => $folder->parent->id,
                        'name' => $folder->parent->name,
                    ]
                    : null,
                'children' => $folder->children->map(function (Folder $child) {
                    return [
                        'id' => $child->id,
                        'name' => $child->name,
                        'parentId' => $child->parent_id,
                    ];
                })->values(),
                'files' => $folder->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->title,
                    ];
                })->values(),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/folders/{id}
     *
     * Rename folder or change its parent.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $folder = Folder::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string'],
            'parentId' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:folders,id',
            ],
        ]);

        if (array_key_exists('parentId', $validated)) {
            $newParentId = $validated['parentId'];

            if (
                $newParentId !== null &&
                (int) $newParentId === $folder->id
            ) {
                throw ValidationException::withMessages([
                    'parentId' => [
                        'A folder cannot be its own parent.',
                    ],
                ]);
            }

            if (
                $newParentId !== null &&
                $this->createsCircularReference(
                    $folder,
                    (int) $newParentId
                )
            ) {
                throw ValidationException::withMessages([
                    'parentId' => [
                        'The selected parent would create a circular folder hierarchy.',
                    ],
                ]);
            }

            $folder->parent_id = $newParentId;
        }

        if (array_key_exists('name', $validated)) {
            $folder->name = $validated['name'];
        }

        $folder->save();

        return response()->json([
            'message' => 'Folder updated successfully.',
            'data' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'parentId' => $folder->parent_id,
            ],
        ]);
    }

    /**
     * DELETE /api/v1/folders/{id}
     *
     * Delete only empty folders.
     */
    public function destroy(string $id): JsonResponse
    {
        $folder = Folder::withCount([
            'children',
            'files',
        ])->findOrFail($id);


        if ($folder->children_count > 0) {
            return response()->json([
                'message' => 'Folder cannot be deleted because it contains child folders.',
            ], Response::HTTP_CONFLICT);
        }

        if ($folder->files_count > 0) {
            return response()->json([
                'message' => 'Folder cannot be deleted because it contains files.',
            ], Response::HTTP_CONFLICT);
        }

        $folder->delete();

        return response()->json([
            'message' => 'Folder deleted successfully.',
        ]);
    }

    /**
     * Build recursive folder hierarchy.
     */
    private function buildTree($folders): array
    {
        return $folders->map(function (Folder $folder) {
            return [
                'id' => $folder->id,
                'name' => $folder->name,
                'parentId' => $folder->parent_id,

                'children' => $this->buildTree(
                    $folder->children()->with([
                        'children',
                        'files',
                    ])->get()
                ),

                'files' => $folder->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->title,
                    ];
                })->values()->all(),
            ];
        })->values()->all();
    }

    /**
     * Check whether assigning the new parent
     * would create a circular reference.
     */
    private function createsCircularReference(
        Folder $folder,
        int $newParentId
    ): bool {
        $currentParent = Folder::find($newParentId);

        while ($currentParent !== null) {

            if ($currentParent->id === $folder->id) {
                return true;
            }

            $currentParent = $currentParent->parent;
        }

        return false;
    }
}