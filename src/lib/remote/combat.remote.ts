/*
    FUNCTIONS NEEDED

    query getPlayerInstance(id: UUID) => returns the instance id a player is in or null
    query getInstance(id: UUID) => returns the data from the instance with the requested id or throws an error
    command tickCombatInstance(id: UUID) => returns updated combat data if enough time has elapsed or returns a timeout object
*/