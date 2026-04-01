#include "DataBaseUpdate.h"
#include "SchemaVersion.h"

DataBaseUpdate::DataBaseUpdate() {}
DataBaseUpdate::~DataBaseUpdate() {}

int DataBaseUpdate::GetTargetVersion() const {
    return SchemaVersion::Current();
}

bool DataBaseUpdate::UpgradeToLatest() {
    return true;
}
