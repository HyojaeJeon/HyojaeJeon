#pragma once

class DataBaseUpdate {
public:
    DataBaseUpdate();
    ~DataBaseUpdate();

    int GetTargetVersion() const;
    bool UpgradeToLatest();
};
