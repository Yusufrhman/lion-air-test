<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable = [
        'folder_id',
        'department_id',
        'uploaded_by',
        'title',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];
    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
